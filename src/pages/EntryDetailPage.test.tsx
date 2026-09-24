import {beforeEach, describe, expect, it, vi} from 'vitest';
import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {mutationsSettled} from '@/test/mutations';
import {discussion, link, note, page, tag} from '@/test/fixtures';
import type {AnyEntry} from '@/types';
import EntryDetailPage from './EntryDetailPage';

vi.mock('@/components/common/editor/RichEditor', () => import('@/test/FakeEditor'));

beforeEach(() => {
    server.use(
        http.get('/api/entry/:id/resource', () => HttpResponse.json([])),
        http.get('/api/entry/:id/comments', () => HttpResponse.json(page([]))),
    );
});

function serveEntry(entry: AnyEntry) {
    server.use(http.get(`/api/entry/${entry.id}`, () => HttpResponse.json(entry)));
}

function renderAt(route: string) {
    return renderWithProviders(<EntryDetailPage/>, {route, path: '/:prefix/:id'});
}

describe('EntryDetailPage', () => {
    it('shows a link with its url, source filter and metadata', async () => {
        serveEntry(link({
            id: 'l1',
            title: 'Rust async',
            url: 'https://blog.rust-lang.org/a',
            source: 'rust-lang.org',
            version: 3,
            tags: [tag({name: 'rust'})]
        }));
        renderAt('/links/l1');

        expect(await screen.findByRole('heading', {name: 'Rust async'})).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /blog\.rust-lang\.org/})).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', {name: /rust-lang\.org$/})).toHaveAttribute('href', '/links?source=rust-lang.org');
        expect(screen.getByText('v3')).toBeInTheDocument();
        expect(screen.getByText('rust')).toBeInTheDocument();
        expect(document.title).toBe('Rust async - Lynks');
    });

    it('renders a note body', async () => {
        serveEntry(note({id: 'n1', renderedContent: '<p>Hello <em>there</em></p>'}));
        renderAt('/notes/n1');
        expect(await screen.findByText('there')).toBeInTheDocument();
    });

    it('shows not found and goes home', async () => {
        server.use(http.get('/api/entry/missing', () => new HttpResponse(null, {status: 404})));
        const {location} = renderAt('/links/missing');

        expect(await screen.findByText('Entry not found')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', {name: 'Back'}));
        expect(location().pathname).toBe('/');
    });

    it('opens the editor', async () => {
        serveEntry(link({id: 'l1'}));
        const {location} = renderAt('/links/l1');

        await screen.findByRole('heading', {name: 'A link'});
        await userEvent.click(within(document.querySelector<HTMLElement>('.entry-detail-header')!).getByRole('button', {name: /Edit/}));

        expect(location().pathname).toBe('/links/l1/edit');
    });

    it('stars the entry', async () => {
        serveEntry(link({id: 'l1'}));
        server.use(http.post('/api/entry/l1/star', () => HttpResponse.json({})));
        renderAt('/links/l1');

        await userEvent.click(await screen.findByRole('button', {name: 'Star entry'}));

        expect(await screen.findByRole('button', {name: 'Unstar entry'})).toBeInTheDocument();
    });

    it('deletes after confirmation and goes home', async () => {
        let deleted = false;
        serveEntry(link({id: 'l1'}));
        server.use(http.delete('/api/link/l1', () => {
            deleted = true;
            return new HttpResponse(null, {status: 204});
        }));
        const {location} = renderAt('/links/l1');
        await screen.findByRole('heading', {name: 'A link'});

        await userEvent.click(document.querySelector('.ant-btn-dangerous')!);
        expect(await screen.findByText('Delete this entry?')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', {name: 'Delete'}));

        expect(await screen.findByText('Entry deleted')).toBeInTheDocument();
        expect(deleted).toBe(true);
        expect(location().pathname).toBe('/');
    });

    it('reports a failed delete once and stays on the entry', async () => {
        serveEntry(link({id: 'l1'}));
        server.use(http.delete('/api/link/l1', () => HttpResponse.json({message: 'Locked'}, {status: 409})));
        const {location, queryClient} = renderAt('/links/l1');
        await screen.findByRole('heading', {name: 'A link'});

        await userEvent.click(document.querySelector('.ant-btn-dangerous')!);
        await userEvent.click(await screen.findByRole('button', {name: 'Delete'}));

        expect(await screen.findByText('Locked')).toBeInTheDocument();
        await mutationsSettled(queryClient);
        expect(screen.getAllByText('Locked')).toHaveLength(1);
        expect(location().pathname).toBe('/links/l1');
    });

    describe('old versions', () => {
        beforeEach(() => {
            serveEntry(link({id: 'l1', title: 'Current', version: 5}));
            server.use(http.get('/api/entry/l1/2', () => HttpResponse.json(link({id: 'l1', title: 'Old title', version: 2}))));
        });

        it('loads the requested version under a banner', async () => {
            renderAt('/links/l1?version=2');

            expect(await screen.findByRole('heading', {name: 'Old title'})).toBeInTheDocument();
            expect(screen.getByText('Viewing version 2')).toBeInTheDocument();
        });

        it('returns to the latest version', async () => {
            const {location} = renderAt('/links/l1?version=2');

            await userEvent.click(await screen.findByRole('button', {name: 'Return to latest version'}));

            expect(location()).toMatchObject({pathname: '/links/l1', search: ''});
            expect(await screen.findByRole('heading', {name: 'Current'})).toBeInTheDocument();
        });

        it('restores the version and lands on the new latest', async () => {
            server.use(http.post('/api/link/l1/revert/2', () => HttpResponse.json(link({
                id: 'l1',
                title: 'Old title',
                version: 6
            }))));
            const {location} = renderAt('/links/l1?version=2');

            await userEvent.click(await screen.findByRole('button', {name: /Restore this version/}));
            await userEvent.click(await screen.findByRole('button', {name: 'Restore'}));

            await waitFor(() => expect(location().search).toBe(''));
            expect(await screen.findByText('Restored version 2 as v6')).toBeInTheDocument();
            await waitFor(() => expect(screen.queryByText('Viewing version 2')).not.toBeInTheDocument());
            expect(screen.getByText('v6')).toBeInTheDocument();
        });
    });

    describe('tabs', () => {
        it('opens resources by default and records the chosen tab in the url', async () => {
            serveEntry(link({id: 'l1'}));
            server.use(http.get('/api/entry/l1/refs', () => HttpResponse.json({inbound: [], outbound: []})));
            const {location} = renderAt('/links/l1');

            expect(await screen.findByText('Resources (0)')).toBeInTheDocument();
            await userEvent.click(screen.getByRole('tab', {name: 'References'}));

            expect(location().search).toBe('?tab=refs');
            expect(await screen.findByText('No references found')).toBeInTheDocument();
        });

        it('counts discussions for links only', async () => {
            serveEntry(link({id: 'l1', props: {attributes: {discussions: [discussion(), discussion({url: 'x'})]}, tasks: []}}));
            const {unmount} = renderAt('/links/l1');
            expect(await screen.findByRole('tab', {name: 'Discussions (2)'})).toBeInTheDocument();
            unmount();

            serveEntry(note({id: 'n1'}));
            renderAt('/notes/n1');
            await screen.findByRole('heading', {name: 'A note'});
            expect(screen.queryByRole('tab', {name: /Discussions/})).not.toBeInTheDocument();
        });

        it('shows the tasks tab only when the entry has tasks', async () => {
            serveEntry(link({id: 'l1'}));
            const {unmount} = renderAt('/links/l1');
            await screen.findByRole('heading', {name: 'A link'});
            expect(screen.queryByRole('tab', {name: 'Tasks'})).not.toBeInTheDocument();
            unmount();

            serveEntry(link({
                id: 'l2',
                props: {attributes: {}, tasks: [{id: 't', description: 'Refetch', className: 'a.B', params: []}]}
            }));
            renderAt('/links/l2?tab=tasks');
            expect(await screen.findByText('Refetch')).toBeInTheDocument();
        });
    });
});
