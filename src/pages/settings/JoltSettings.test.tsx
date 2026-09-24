import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {user} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import JoltSettings from './JoltSettings';

describe('JoltSettings', () => {
    it('saves a token and updates the cached user', async () => {
        let body: unknown;
        server.use(
            http.get('/api/user', () => HttpResponse.json(user({joltConfigured: false}))),
            http.put('/api/user/jolt', async ({request}) => {
                body = await request.json();
                return HttpResponse.json(user({joltConfigured: true}));
            }),
        );
        const {queryClient} = renderWithProviders(<JoltSettings/>);

        expect(await screen.findByText(/No token is set/)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
        await userEvent.type(screen.getByPlaceholderText('Inbound channel token'), 'secret');
        await userEvent.click(screen.getByRole('button', {name: 'Save'}));

        expect(await screen.findByText('Jolt token saved')).toBeInTheDocument();
        expect(body).toEqual({token: 'secret'});
        expect(queryClient.getQueryData(QK.user())).toMatchObject({joltConfigured: true});
        expect(screen.getByText(/A token is set/)).toBeInTheDocument();
    });

    it('removes a token after confirmation', async () => {
        let body: unknown;
        server.use(
            http.get('/api/user', () => HttpResponse.json(user({joltConfigured: true}))),
            http.put('/api/user/jolt', async ({request}) => {
                body = await request.json();
                return HttpResponse.json(user({joltConfigured: false}));
            }),
        );
        renderWithProviders(<JoltSettings/>);

        await userEvent.click(await screen.findByRole('button', {name: 'Remove token'}));
        await userEvent.click(await screen.findByRole('button', {name: 'OK'}));

        expect(await screen.findByText('Jolt token removed')).toBeInTheDocument();
        expect(body).toEqual({token: null});
    });
});
