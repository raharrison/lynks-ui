import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {page, slimLink, user} from '@/test/fixtures';

// App builds its browser router and query client at import, so each test loads a fresh copy at its own url
async function renderAppAt(path: string) {
    window.history.replaceState(null, '', path);
    vi.resetModules();
    const {default: App} = await import('./App');
    return render(<App/>);
}

let signedIn = false;

beforeEach(() => {
    signedIn = false;
    server.use(
        http.get('/api/user', () => signedIn ? HttpResponse.json(user()) : new HttpResponse(null, {status: 401})),
        http.post('/api/login', () => {
            signedIn = true;
            return HttpResponse.json({result: 'success'});
        }),
        http.get('/api/auth/config', () => HttpResponse.json({passwordLogin: true, sso: null})),
        http.get('/api/notifications/unread', () => HttpResponse.json({unread: 0})),
        http.get('/api/tag', () => HttpResponse.json([])),
        http.get('/api/collection', () => HttpResponse.json([])),
        http.get('/api/entry', () => HttpResponse.json(page([slimLink({title: 'Welcome back'})]))),
        http.get('/api/link', () => HttpResponse.json(page([]))),
    );
});

// Each test imports the whole app afresh, which is slow when the suite runs in parallel
describe('App', {timeout: 30_000}, () => {
    it('sends a signed out visitor to the login page', async () => {
        await renderAppAt('/links');

        expect(await screen.findByRole('button', {name: 'Sign In'}, {timeout: 10_000})).toBeInTheDocument();
        expect(window.location.pathname).toBe('/login');
        expect(window.location.search).toBe('?returnTo=%2Flinks');
    });

    it('returns to the requested page after signing in', async () => {
        await renderAppAt('/links');

        await userEvent.type(await screen.findByPlaceholderText('Username', {}, {timeout: 10_000}), 'ryan');
        await userEvent.type(screen.getByPlaceholderText('Password'), 'pw');
        await userEvent.click(screen.getByRole('button', {name: 'Sign In'}));

        expect(await screen.findByText('No entries found', {}, {timeout: 10_000})).toBeInTheDocument();
        expect(window.location.pathname).toBe('/links');
    });

    it('sends a signed in user away from the login page', async () => {
        signedIn = true;
        await renderAppAt('/login');

        expect(await screen.findByText('Welcome back', {}, {timeout: 10_000})).toBeInTheDocument();
        expect(window.location.pathname).toBe('/');
    });

    it('lets a signed in user open a list directly', async () => {
        signedIn = true;
        await renderAppAt('/links');

        expect(await screen.findByText('No entries found', {}, {timeout: 10_000})).toBeInTheDocument();
        expect(window.location.pathname).toBe('/links');
    });

    it('lands on the entries after signing in', async () => {
        await renderAppAt('/');

        await userEvent.type(await screen.findByPlaceholderText('Username', {}, {timeout: 10_000}), 'ryan');
        await userEvent.type(screen.getByPlaceholderText('Password'), 'pw');
        await userEvent.click(screen.getByRole('button', {name: 'Sign In'}));

        expect(await screen.findByText('Welcome back', {}, {timeout: 10_000})).toBeInTheDocument();
        await waitFor(() => expect(window.location.pathname).toBe('/'));
    });

    it('applies the resolved theme to the document', async () => {
        localStorage.setItem('lynks-theme', JSON.stringify({state: {mode: 'dark'}, version: 0}));
        await renderAppAt('/login');

        await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    });
});
