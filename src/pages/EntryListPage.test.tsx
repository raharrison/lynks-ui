import {beforeEach, describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse, type JsonBodyType} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {page, slimLink, slimNote} from '@/test/fixtures';
import EntryListPage from './EntryListPage';

let requests: { path: string; params: Record<string, string> }[] = [];

function serve(path: string, body: JsonBodyType) {
    server.use(http.get(path, ({request}) => {
        const url = new URL(request.url);
        requests.push({path: url.pathname, params: Object.fromEntries(url.searchParams)});
        return HttpResponse.json(body);
    }));
}

beforeEach(() => {
    requests = [];
    server.use(
        http.get('/api/tag', () => HttpResponse.json([])),
        http.get('/api/collection', () => HttpResponse.json([])),
    );
});

function renderAt(route: string) {
    return renderWithProviders(<EntryListPage/>, {route, path: '/:entryType?'});
}

const params = (location: { search: string }) => Object.fromEntries(new URLSearchParams(location.search));

describe('EntryListPage', () => {
    it('lists all entries with the default query', async () => {
        serve('/api/entry', page([slimLink({title: 'First'}), slimNote({title: 'Second'})]));
        renderAt('/');

        expect(await screen.findByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText('Entries')).toBeInTheDocument();
        expect(screen.getByText('(2)')).toBeInTheDocument();
        expect(requests).toEqual([{path: '/api/entry', params: {page: '1', size: '25', sort: 'dateUpdated', direction: 'desc'}}]);
    });

    it('lists one type from its path and passes every filter from the url', async () => {
        serve('/api/note', page([slimNote()]));
        renderAt('/notes?tags=t1,t2&collections=c1&source=hn&sort=title&dir=asc&page=2&size=10');

        await screen.findByText('A note');
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(requests[0]).toEqual({
            path: '/api/note',
            params: {page: '2', size: '10', tags: 't1,t2', collections: 'c1', source: 'hn', sort: 'title', direction: 'asc'},
        });
        expect(document.title).toBe('Notes - Lynks');
    });

    it('searches when there is a query and counts results', async () => {
        serve('/api/entry/search', page([slimLink({title: 'Hit'})]));
        renderAt('/?q=rust');

        await screen.findByText('Hit');
        expect(screen.getByText('Search: "rust"')).toBeInTheDocument();
        expect(screen.getByText('1 result')).toBeInTheDocument();
        expect(requests[0].params.q).toBe('rust');
        expect(document.title).toBe('Search: rust - Lynks');
    });

    it('says when a search finds nothing', async () => {
        serve('/api/entry/search', page([]));
        renderAt('/?q=zzz');
        expect(await screen.findByText('No results for "zzz"')).toBeInTheDocument();
    });

    it('shows empty and error states', async () => {
        serve('/api/link', page([]));
        const {unmount} = renderAt('/links');
        expect(await screen.findByText('No entries found')).toBeInTheDocument();
        unmount();

        server.use(http.get('/api/entry', () => new HttpResponse(null, {status: 500})));
        renderAt('/');
        expect(await screen.findByText('Failed to load entries')).toBeInTheDocument();
    });

    it('drops relevance sorting once the search is cleared', async () => {
        serve('/api/entry', page([]));
        const {location} = renderAt('/?sort=mostRelevant&tags=t1');

        await waitFor(() => expect(params(location())).toEqual({tags: 't1'}));
    });

    it('changes direction from the toolbar', async () => {
        serve('/api/entry', page([slimLink()]));
        const {location} = renderAt('/?sort=title&page=3');
        await screen.findByText('A link');

        await userEvent.click(screen.getByTitle('Ascending'));
        expect(params(location())).toEqual({sort: 'title', dir: 'asc'});

        await userEvent.click(screen.getByTitle('Random order'));
        expect(params(location())).toEqual({sort: 'title', dir: 'rand'});
    });

    it('changes the sort field', async () => {
        serve('/api/entry', page([slimLink()]));
        const {location} = renderAt('/');
        await screen.findByText('A link');

        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(await screen.findByTitle('Title'));

        expect(params(location())).toEqual({sort: 'title'});
    });

    it('offers relevance only while searching', async () => {
        serve('/api/entry/search', page([slimLink()]));
        renderAt('/?q=x');
        await screen.findByText('A link');

        await userEvent.click(screen.getByRole('combobox'));

        expect(await screen.findByTitle('Relevance')).toBeInTheDocument();
    });

    it('filters by domain on enter and clears when emptied', async () => {
        serve('/api/entry', page([slimLink()]));
        const {location} = renderAt('/');
        const input = screen.getByPlaceholderText('Filter by domain...');

        await userEvent.type(input, '  github.com {Enter}');
        expect(params(location())).toEqual({source: 'github.com'});

        await userEvent.clear(screen.getByPlaceholderText('Filter by domain...'));
        await waitFor(() => expect(location().search).toBe(''));
    });

    it('paginates when there is more than one page', async () => {
        serve('/api/entry', page([slimLink()], {total: 60}));
        const {location} = renderAt('/?sort=title');

        expect(await screen.findByText('60 entries')).toBeInTheDocument();
        await userEvent.click(screen.getByTitle('2'));

        expect(params(location())).toEqual({sort: 'title', page: '2'});
    });

    it('stars from the list', async () => {
        let starred = false;
        serve('/api/entry', page([slimLink({id: 'l1'})]));
        server.use(http.post('/api/entry/l1/star', () => {
            starred = true;
            return HttpResponse.json({});
        }));
        renderAt('/');

        await userEvent.click(await screen.findByRole('button', {name: 'Star entry'}));

        await waitFor(() => expect(starred).toBe(true));
        expect(await screen.findByRole('button', {name: 'Unstar entry'})).toBeInTheDocument();
    });
});
