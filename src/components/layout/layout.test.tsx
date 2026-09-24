import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {collection, tag, user} from '@/test/fixtures';
import {useAuthStore} from '@/stores/authStore';
import {useSidebarStore} from '@/stores/sidebarStore';
import {useThemeStore} from '@/stores/themeStore';
import AppHeader from './AppHeader';
import AppLayout from './AppLayout';
import AppSidebar from './AppSidebar';

beforeEach(() => {
    useAuthStore.setState({user: user({username: 'ryan', displayName: null})});
    useSidebarStore.setState({collapsed: false});
    useThemeStore.setState({mode: 'system', resolved: 'light'});
    server.use(
        http.get('/api/notifications/unread', () => HttpResponse.json({unread: 0})),
        http.get('/api/tag', () => HttpResponse.json([tag({
            id: 't1',
            name: 'rust',
            children: [tag({id: 't2', name: 'async'})]
        })])),
        http.get('/api/collection', () => HttpResponse.json([collection({id: 'c1', name: 'Reading'})])),
    );
});

const search = () => screen.getByPlaceholderText('Search entries...');

/** A sidebar section's header row, which holds its manage, refresh and add buttons. */
const sectionHeader = (name: string) => within(screen.getByText(name).closest('button')!.parentElement!);

describe('AppHeader', () => {
    it('searches within the current list, keeping its filters', async () => {
        const {location} = renderWithProviders(<AppHeader/>, {route: '/links?tags=t1&page=4'});

        await userEvent.type(search(), 'tokio{Enter}');

        expect(location().pathname).toBe('/links');
        expect(Object.fromEntries(new URLSearchParams(location().search))).toEqual({tags: 't1', q: 'tokio'});
    });

    it('searches all entries from anywhere else', async () => {
        const {location} = renderWithProviders(<AppHeader/>, {route: '/settings?tab=tags'});

        await userEvent.type(search(), 'tokio{Enter}');

        expect(location().pathname).toBe('/');
        expect(location().search).toBe('?q=tokio');
    });

    it('follows the query in the url and clears it', async () => {
        const {location, router} = renderWithProviders(<AppHeader/>, {route: '/?q=first'});
        expect(search()).toHaveValue('first');

        await act(() => router.navigate('/?q=second'));
        expect(search()).toHaveValue('second');

        await userEvent.click(screen.getByRole('button', {name: 'close-circle'}));
        expect(location().search).toBe('');
    });

    it('shows the unread count', async () => {
        server.use(http.get('/api/notifications/unread', () => HttpResponse.json({unread: 7})));
        renderWithProviders(<AppHeader/>);
        expect(await screen.findByText('7')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /bell/})).toHaveAttribute('href', '/notifications');
    });

    it('creates any entry type from the menu', async () => {
        const {location} = renderWithProviders(<AppHeader/>);

        await userEvent.click(screen.getByRole('button', {name: /Create/}));
        await userEvent.click(await screen.findByText('New Snippet'));

        expect(location().pathname).toBe('/snippets/create');
    });

    it('highlights and follows the nav', async () => {
        const {location} = renderWithProviders(<AppHeader/>, {route: '/notes/n1'});
        const nav = screen.getByRole('menu');

        expect(within(nav).getByText('Notes').closest('li')).toHaveClass('ant-menu-item-selected');
        await userEvent.click(within(nav).getByText('Digest'));
        expect(location().pathname).toBe('/digest');
    });

    it('toggles the sidebar', async () => {
        renderWithProviders(<AppHeader/>);

        await userEvent.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

        expect(useSidebarStore.getState().collapsed).toBe(true);
        expect(screen.getByRole('button', {name: 'Expand sidebar'})).toBeInTheDocument();
    });

    it('shows the user and switches theme from the user menu', async () => {
        renderWithProviders(<AppHeader/>);
        expect(screen.getByText('R')).toBeInTheDocument();

        await userEvent.click(screen.getByText('ryan'));
        await userEvent.click(await screen.findByRole('img', {name: 'moon'}));

        expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('logs out to the login page', async () => {
        server.use(http.post('/api/logout', () => new HttpResponse(null, {status: 204})));
        const {location} = renderWithProviders(<AppHeader/>);

        await userEvent.click(screen.getByText('ryan'));
        await userEvent.click(await screen.findByText('Logout'));

        await waitFor(() => expect(location().pathname).toBe('/login'));
        expect(useAuthStore.getState().user).toBeNull();
    });

    it('still leaves when logout fails, with a warning', async () => {
        server.use(http.post('/api/logout', () => new HttpResponse(null, {status: 500})));
        const {location} = renderWithProviders(<AppHeader/>);

        await userEvent.click(screen.getByText('ryan'));
        await userEvent.click(await screen.findByText('Logout'));

        expect(await screen.findByText(/Logout failed/)).toBeInTheDocument();
        expect(location().pathname).toBe('/login');
    });
});

describe('keyboard shortcuts', () => {
    const press = (key: string, init: KeyboardEventInit = {}) => fireEvent.keyDown(document.body, {key, ...init});

    it.each([
        [['g', 'l'], '/links'],
        [['g', 'n'], '/notes'],
        [['g', 'h'], '/'],
        [['c', 'l'], '/links/create'],
        [['c', 'f'], '/files/create'],
    ])('%j goes to %s', (keys, path) => {
        const {location} = renderWithProviders(<AppLayout/>, {route: '/settings'});
        keys.forEach((k) => press(k));
        expect(location().pathname).toBe(path);
    });

    it('ignores keys typed into fields and with modifiers', () => {
        const {location} = renderWithProviders(<AppLayout/>, {route: '/settings'});

        fireEvent.keyDown(search(), {key: 'g'});
        fireEvent.keyDown(search(), {key: 'l'});
        press('g', {ctrlKey: true});
        press('l');

        expect(location().pathname).toBe('/settings');
    });

    it('forgets a chord that is not finished in time', () => {
        vi.useFakeTimers();
        try {
            const {location} = renderWithProviders(<AppLayout/>, {route: '/settings'});
            press('g');
            act(() => vi.advanceTimersByTime(1100));
            press('l');
            expect(location().pathname).toBe('/settings');
        } finally {
            vi.useRealTimers();
        }
    });

    it('focuses search and shows help', async () => {
        renderWithProviders(<AppLayout/>);

        press('/');
        expect(search()).toHaveFocus();

        press('?');
        expect(await screen.findByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
});

describe('AppSidebar', () => {
    afterEach(() => {
        window.innerWidth = 1024;
    });

    it('shows nested tags and collections and filters by them', async () => {
        const {location} = renderWithProviders(<AppSidebar/>, {route: '/notes?q=x'});

        await userEvent.click(await screen.findByText('rust'));
        expect(location()).toMatchObject({pathname: '/notes'});
        expect(Object.fromEntries(new URLSearchParams(location().search))).toEqual({tags: 't1', q: 'x'});

        await userEvent.click(screen.getByText('Reading'));
        expect(new URLSearchParams(location().search).get('collections')).toBe('c1');
    });

    it('selects the active filters', async () => {
        renderWithProviders(<AppSidebar/>, {route: '/?collections=c1'});
        const node = (await screen.findByText('Reading')).closest('.ant-tree-treenode');
        expect(node).toHaveClass('ant-tree-treenode-selected');
    });

    it('refreshes tags on request', async () => {
        let refreshed = false;
        server.use(http.post('/api/tag/refresh', () => {
            refreshed = true;
            return new HttpResponse(null, {status: 204});
        }));
        renderWithProviders(<AppSidebar/>);
        await screen.findByText('rust');

        await userEvent.click(sectionHeader('Tags').getByRole('button', {name: 'reload'}));

        await waitFor(() => expect(refreshed).toBe(true));
    });

    it('opens the modal to add a collection', async () => {
        renderWithProviders(<AppSidebar/>);

        await userEvent.click(sectionHeader('Collections').getByRole('button', {name: 'plus'}));

        expect(await screen.findByText('New Collection')).toBeInTheDocument();
    });

    it('collapses a section', async () => {
        renderWithProviders(<AppSidebar/>);
        await screen.findByText('rust');

        await userEvent.click(screen.getByText('Tags'));

        expect(screen.queryByText('rust')).not.toBeInTheDocument();
        expect(screen.getByText('Reading')).toBeInTheDocument();
    });

    it('says when there are no groups', async () => {
        server.use(
            http.get('/api/tag', () => HttpResponse.json([])),
            http.get('/api/collection', () => HttpResponse.json([])),
        );
        renderWithProviders(<AppSidebar/>);
        expect(await screen.findByText(/No\s+tags yet/)).toBeInTheDocument();
        expect(screen.getByText(/No\s+collections yet/)).toBeInTheDocument();
    });

    it('renders nothing on desktop when collapsed', () => {
        useSidebarStore.setState({collapsed: true});
        renderWithProviders(<AppSidebar/>);
        expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });

    it('becomes a drawer with navigation on mobile, collapsed by default', async () => {
        window.innerWidth = 500;
        const {location} = renderWithProviders(<AppSidebar/>);
        expect(useSidebarStore.getState().collapsed).toBe(true);

        act(() => useSidebarStore.getState().setCollapsed(false));
        await userEvent.click(await screen.findByText('Snippets'));

        expect(location().pathname).toBe('/snippets');
        expect(useSidebarStore.getState().collapsed).toBe(true);
    });
});
