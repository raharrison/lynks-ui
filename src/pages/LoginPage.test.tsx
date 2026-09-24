import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {user} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import type {AuthRequest} from '@/types';
import LoginPage from './LoginPage';

async function signIn(username = 'ryan', password = 'hunter2') {
    await userEvent.type(screen.getByPlaceholderText('Username'), username);
    await userEvent.type(screen.getByPlaceholderText('Password'), password);
    await userEvent.click(screen.getByRole('button', {name: 'Sign In'}));
}

describe('LoginPage', () => {
    it('requires both fields', async () => {
        renderWithProviders(<LoginPage/>);

        await userEvent.click(screen.getByRole('button', {name: 'Sign In'}));

        expect(await screen.findByText('Username required')).toBeInTheDocument();
        expect(screen.getByText('Password required')).toBeInTheDocument();
    });

    it('stores the signed in user so the auth gate moves on', async () => {
        server.use(
            http.post('/api/login', () => HttpResponse.json({result: 'success'})),
            http.get('/api/user', () => HttpResponse.json(user())),
        );
        const {queryClient} = renderWithProviders(<LoginPage/>);

        await signIn();

        await waitFor(() => expect(queryClient.getQueryData(QK.user())).toEqual(user()));
    });

    it('reports invalid credentials', async () => {
        server.use(http.post('/api/login', () => HttpResponse.json({result: 'invalid_credentials'}, {status: 401})));
        renderWithProviders(<LoginPage/>);

        await signIn();

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });

    it('reports a server failure', async () => {
        server.use(http.post('/api/login', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<LoginPage/>);

        await signIn();

        expect(await screen.findByText('Login failed')).toBeInTheDocument();
    });

    describe('two factor', () => {
        it('asks for a code and resends the credentials with it', async () => {
            const requests: AuthRequest[] = [];
            server.use(
                http.post('/api/login', async ({request}) => {
                    const body = await request.json() as AuthRequest;
                    requests.push(body);
                    return body.totp
                        ? HttpResponse.json({result: 'success'})
                        : HttpResponse.json({result: 'totp_required'}, {status: 401});
                }),
                http.get('/api/user', () => HttpResponse.json(user())),
            );
            const {queryClient} = renderWithProviders(<LoginPage/>);

            await signIn('ryan', 'pw');
            await userEvent.type(await screen.findByPlaceholderText('Authentication code'), '123456');
            await userEvent.click(screen.getByRole('button', {name: 'Verify'}));

            await waitFor(() => expect(queryClient.getQueryData(QK.user())).toEqual(user()));
            expect(requests).toEqual([
                {username: 'ryan', password: 'pw'},
                {username: 'ryan', password: 'pw', totp: '123456'},
            ]);
        });

        it('reports a wrong code', async () => {
            server.use(http.post('/api/login', async ({request}) => {
                const body = await request.json() as AuthRequest;
                return HttpResponse.json({result: body.totp ? 'invalid_credentials' : 'totp_required'}, {status: 401});
            }));
            renderWithProviders(<LoginPage/>);

            await signIn();
            await userEvent.type(await screen.findByPlaceholderText('Authentication code'), '000000');
            await userEvent.click(screen.getByRole('button', {name: 'Verify'}));

            expect(await screen.findByText('Invalid code')).toBeInTheDocument();
        });

        it('goes back to the password form', async () => {
            server.use(http.post('/api/login', () => HttpResponse.json({result: 'totp_required'}, {status: 401})));
            renderWithProviders(<LoginPage/>);

            await signIn();
            await userEvent.click(await screen.findByRole('button', {name: 'Back to login'}));

            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('Authentication code')).not.toBeInTheDocument();
        });
    });
});
