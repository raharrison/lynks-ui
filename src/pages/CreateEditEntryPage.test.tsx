import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {note} from '@/test/fixtures';
import CreateEntryPage from './CreateEntryPage';
import EditEntryPage from './EditEntryPage';

vi.mock('@/components/common/editor/RichEditor', () => import('@/test/FakeEditor'));

beforeEach(() => {
    server.use(
        http.get('/api/tag', () => HttpResponse.json([])),
        http.get('/api/collection', () => HttpResponse.json([])),
    );
});

function renderCreate() {
    return renderWithProviders(<CreateEntryPage type="note"/>, {route: '/notes/create', path: '/notes/create'});
}

describe('CreateEntryPage', () => {
    it('shows the heading and the type hint', () => {
        renderCreate();
        expect(screen.getByRole('heading', {name: 'New note'})).toBeInTheDocument();
        expect(screen.getByText(/Press @ to link another entry/)).toBeInTheDocument();
        expect(document.title).toBe('New Note - Lynks');
    });

    it('leaves freely while nothing has changed', async () => {
        const {location} = renderCreate();

        await userEvent.click(screen.getByRole('button', {name: 'Cancel'}));

        expect(location().pathname).toBe('/notes');
        expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
    });

    it('asks before discarding changes, and can keep editing', async () => {
        const {location, router} = renderCreate();
        await userEvent.type(screen.getByPlaceholderText('Untitled note'), 'Draft');
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

        await act(() => router.navigate('/'));

        expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', {name: 'Keep editing'}));
        expect(location().pathname).toBe('/notes/create');
        expect(screen.getByPlaceholderText('Untitled note')).toHaveValue('Draft');
    });

    it('discards changes on request', async () => {
        const {location} = renderCreate();
        await userEvent.type(screen.getByLabelText('Editor'), 'text');

        await userEvent.click(screen.getByRole('button', {name: /Back/}));
        await userEvent.click(await screen.findByRole('button', {name: 'Discard'}));

        await waitFor(() => expect(location().pathname).toBe('/notes'));
    });

    it('goes to the new entry after saving without asking', async () => {
        server.use(http.post('/api/note', () => HttpResponse.json(note({id: 'n9'}))));
        const {location} = renderCreate();
        await userEvent.type(screen.getByPlaceholderText('Untitled note'), 'Draft');

        await userEvent.click(screen.getByRole('button', {name: /Create Note/}));

        await waitFor(() => expect(location().pathname).toBe('/notes/n9'));
        expect(location().state).toEqual({savedEntry: true});
        expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
    });

    it('saves with ctrl+s', async () => {
        server.use(http.post('/api/note', () => HttpResponse.json(note({id: 'n9'}))));
        const {location} = renderCreate();
        await userEvent.type(screen.getByPlaceholderText('Untitled note'), 'Draft');

        await userEvent.keyboard('{Control>}s{/Control}');

        await waitFor(() => expect(location().pathname).toBe('/notes/n9'));
    });
});

describe('EditEntryPage', () => {
    function renderEdit(id = 'n1') {
        return renderWithProviders(<EditEntryPage/>, {route: `/notes/${id}/edit`, path: '/notes/:id/edit'});
    }

    it('loads the entry into its form', async () => {
        server.use(http.get('/api/entry/n1', () => HttpResponse.json(note({id: 'n1', title: 'Plans', plainContent: 'body'}))));
        renderEdit();

        expect(await screen.findByRole('heading', {name: 'Edit note'})).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Untitled note')).toHaveValue('Plans');
        expect(screen.getByLabelText('Editor')).toHaveValue('body');
        expect(document.title).toBe('Edit Plans - Lynks');
    });

    it('saves back to the detail page', async () => {
        server.use(
            http.get('/api/entry/n1', () => HttpResponse.json(note({id: 'n1'}))),
            http.put('/api/note', () => HttpResponse.json(note({id: 'n1'}))),
        );
        const {location} = renderEdit();
        await userEvent.type(await screen.findByLabelText('Editor'), '!');

        await userEvent.click(screen.getByRole('button', {name: /Save/}));

        await waitFor(() => expect(location().pathname).toBe('/notes/n1'));
    });

    it('cancels back to the detail page', async () => {
        server.use(http.get('/api/entry/n1', () => HttpResponse.json(note({id: 'n1'}))));
        const {location} = renderEdit();

        await userEvent.click(await screen.findByRole('button', {name: 'Cancel'}));

        expect(location().pathname).toBe('/notes/n1');
    });

    it('shows not found', async () => {
        server.use(http.get('/api/entry/gone', () => new HttpResponse(null, {status: 404})));
        renderEdit('gone');
        expect(await screen.findByText('Entry not found')).toBeInTheDocument();
    });
});
