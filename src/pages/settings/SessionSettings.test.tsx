import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {userSession} from '@/test/fixtures';
import type {UserSession} from '@/types';
import SessionSettings from './SessionSettings';

const FIREFOX_LINUX = 'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0';

function serveSessions(initial: UserSession[]) {
    let sessions = initial;
    const revoked: string[] = [];
    server.use(
        http.get('/api/user/sessions', () => HttpResponse.json(sessions)),
        http.delete('/api/user/sessions/:id', ({params}) => {
            revoked.push(params.id as string);
            sessions = sessions.filter((session) => session.id !== params.id);
            return new HttpResponse(null, {status: 200});
        }),
        http.delete('/api/user/sessions', () => {
            revoked.push('others');
            sessions = sessions.filter((session) => session.current);
            return new HttpResponse(null, {status: 200});
        }),
    );
    return revoked;
}

describe('SessionSettings', () => {
    it('lists sessions with the current one marked', async () => {
        serveSessions([
            userSession({id: 's1', current: true, method: 'oidc'}),
            userSession({id: 's2', userAgent: FIREFOX_LINUX, ip: null}),
        ]);
        renderWithProviders(<SessionSettings/>);

        expect(await screen.findByText('Chrome on Windows')).toBeInTheDocument();
        expect(screen.getByText('This device')).toBeInTheDocument();
        expect(screen.getByText(/Single sign-on · 203\.0\.113\.4 · active/)).toBeInTheDocument();
        expect(screen.getByText(/^Password · active/)).toBeInTheDocument();
        // only the other session can be signed out from here
        expect(screen.getAllByRole('button', {name: /^Sign out Firefox on Linux$/})).toHaveLength(1);
        expect(screen.queryByRole('button', {name: /^Sign out Chrome on Windows$/})).not.toBeInTheDocument();
    });

    it('signs out one session after confirmation', async () => {
        const revoked = serveSessions([
            userSession({id: 's1', current: true}),
            userSession({id: 's2', userAgent: FIREFOX_LINUX}),
        ]);
        renderWithProviders(<SessionSettings/>);

        await userEvent.click(await screen.findByRole('button', {name: 'Sign out Firefox on Linux'}));
        await userEvent.click(await screen.findByRole('button', {name: 'Sign out'}));

        expect(await screen.findByText('Session signed out')).toBeInTheDocument();
        expect(revoked).toEqual(['s2']);
        await waitFor(() => expect(screen.queryByText('Firefox on Linux')).not.toBeInTheDocument());
    });

    it('signs out every other session', async () => {
        const revoked = serveSessions([
            userSession({id: 's1', current: true}),
            userSession({id: 's2', userAgent: FIREFOX_LINUX}),
        ]);
        renderWithProviders(<SessionSettings/>);

        await userEvent.click(await screen.findByRole('button', {name: /Sign out other sessions/}));
        await userEvent.click(await screen.findByRole('button', {name: 'Sign out'}));

        expect(await screen.findByText('Signed out of every other session')).toBeInTheDocument();
        expect(revoked).toEqual(['others']);
        await waitFor(() => expect(screen.queryByRole('button', {name: /Sign out other sessions/})).not.toBeInTheDocument());
    });

    it('offers nothing to sign out when this is the only session', async () => {
        serveSessions([userSession({current: true})]);
        renderWithProviders(<SessionSettings/>);

        expect(await screen.findByText('This device')).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /Sign out/})).not.toBeInTheDocument();
    });

    it('reports a failure to load', async () => {
        server.use(http.get('/api/user/sessions', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<SessionSettings/>);

        expect(await screen.findByText('Failed to load sessions')).toBeInTheDocument();
    });
});
