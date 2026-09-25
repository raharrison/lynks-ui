import {beforeEach, describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {authConfig, user} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import type {AuthRequest} from '@/types';
import LoginPage from './LoginPage';

async function signIn(username = 'ryan', password = 'hunter2') {
    await userEvent.type(screen.getByPlaceholderText('Username'), username);
    await userEvent.type(screen.getByPlaceholderText('Password'), password);
    await userEvent.click(screen.getByRole('button', {name: 'Sign In'}));
}

describe('LoginPage', () => {
    beforeEach(() => {
        server.use(http.get('/api/auth/config', () => HttpResponse.json(authConfig())));
    });

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

    describe('single sign-on', () => {
        it('offers no sign-on button when the server has none configured', async () => {
            renderWithProviders(<LoginPage/>);

            expect(await screen.findByRole('button', {name: 'Sign In'})).toBeInTheDocument();
            expect(screen.queryByRole('link', {name: /Sign in with/})).not.toBeInTheDocument();
        });

        it('links to the server with the page to come back to', async () => {
            server.use(http.get('/api/auth/config', () => HttpResponse.json(authConfig({sso: {label: 'Sign in with Authelia'}}))));
            renderWithProviders(<LoginPage/>, {route: '/login?returnTo=%2Fnotes%2Fabc'});

            const button = await screen.findByRole('link', {name: /Sign in with Authelia/});
            expect(button).toHaveAttribute('href', '/api/auth/oidc/login?returnTo=%2Fnotes%2Fabc');
            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        });

        it('never passes an unsafe return path on', async () => {
            server.use(http.get('/api/auth/config', () => HttpResponse.json(authConfig({sso: {label: 'SSO'}}))));
            renderWithProviders(<LoginPage/>, {route: '/login?returnTo=%2F%2Fevil.example'});

            expect(await screen.findByRole('link', {name: /SSO/})).toHaveAttribute('href', '/api/auth/oidc/login');
        });

        it('hides the password form when password sign in is disabled', async () => {
            server.use(http.get('/api/auth/config', () =>
                HttpResponse.json(authConfig({passwordLogin: false, sso: {label: 'Sign in with Authelia'}}))));
            renderWithProviders(<LoginPage/>);

            expect(await screen.findByRole('link', {name: /Sign in with Authelia/})).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('Username')).not.toBeInTheDocument();
            expect(screen.queryByText('or')).not.toBeInTheDocument();
        });

        it('keeps the password form when the config cannot be loaded', async () => {
            server.use(http.get('/api/auth/config', () => new HttpResponse(null, {status: 500})));
            renderWithProviders(<LoginPage/>);

            await waitFor(() => expect(screen.getByPlaceholderText('Username')).toBeInTheDocument());
        });

        it.each([
            ['unlinked', /No Lynks account matches that sign-on/],
            ['denied', /refused for this account/],
            ['expired', /expired or was started in another browser/],
            ['unavailable', /cannot be reached right now/],
            ['failed', /Single sign-on failed/],
            ['something-new', /Single sign-on failed/],
        ])('explains the %s result', async (code, text) => {
            renderWithProviders(<LoginPage/>, {route: `/login?sso=${code}`});

            expect(await screen.findByText(text)).toBeInTheDocument();
        });
    });
});
