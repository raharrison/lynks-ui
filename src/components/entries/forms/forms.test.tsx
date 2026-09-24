import {beforeEach, describe, expect, it, vi} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {apiError} from '@/test/errors';
import {collection, fileEntry, link, note, resource, slimLink, snippet, tag} from '@/test/fixtures';
import {uploadResource} from '@/api/resources';
import LinkForm from './LinkForm';
import NoteForm from './NoteForm';
import SnippetForm from './SnippetForm';
import FileForm from './FileForm';

vi.mock('@/components/common/editor/RichEditor', () => import('@/test/FakeEditor'));
// jsdom FormData holding a File cannot cross Vitest's fetch bridge, so multipart uploads are asserted at the api call
vi.mock('@/api/resources', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/api/resources')>(),
    uploadResource: vi.fn(),
}));

let saved: { method: string; body: unknown }[] = [];

function captureSave(type: string, response = {id: 'saved1'}) {
    const handler = async ({request}: { request: Request }) => {
        saved.push({method: request.method, body: await request.json()});
        return HttpResponse.json(response);
    };
    server.use(http.post(`/api/${type}`, handler), http.put(`/api/${type}`, handler));
}

beforeEach(() => {
    saved = [];
    server.use(
        http.get('/api/tag', () => HttpResponse.json([tag({id: 't1', name: 'rust'})])),
        http.get('/api/collection', () => HttpResponse.json([collection({id: 'c1', name: 'Reading'})])),
        http.post('/api/link/checkExisting', () => HttpResponse.json([])),
    );
});

describe('LinkForm', () => {
    it('requires a valid url and a title', async () => {
        renderWithProviders(<LinkForm/>);

        await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'not a url');
        await userEvent.click(screen.getByRole('button', {name: /Create Link/}));

        expect(await screen.findByText('Valid URL required')).toBeInTheDocument();
        expect(await screen.findByText("'title' is required")).toBeInTheDocument();
    });

    it('creates a link with processing on by default', async () => {
        captureSave('link');
        const onSuccess = vi.fn();
        const onDirtyChange = vi.fn();
        renderWithProviders(<LinkForm onSuccess={onSuccess} onDirtyChange={onDirtyChange}/>);

        await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com/post');
        await userEvent.type(screen.getByPlaceholderText('Link title'), 'A post');
        await userEvent.click(screen.getByRole('button', {name: /Create Link/}));

        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('saved1'));
        expect(onDirtyChange).toHaveBeenCalledWith(true);
        expect(saved).toEqual([{
            method: 'POST',
            body: {title: 'A post', url: 'https://example.com/post', tags: [], collections: [], process: true},
        }]);
        expect(await screen.findByText('Link created')).toBeInTheDocument();
    });

    it('updates an existing link without reprocessing by default', async () => {
        captureSave('link', {id: 'l1'});
        const entry = link({
            id: 'l1',
            title: 'Old',
            url: 'https://x.dev',
            tags: [tag({id: 't1'})],
            collections: [collection({id: 'c1'})]
        });
        renderWithProviders(<LinkForm entry={entry}/>);

        expect(screen.getByText('Re-process')).toBeInTheDocument();
        await userEvent.clear(screen.getByPlaceholderText('Link title'));
        await userEvent.type(screen.getByPlaceholderText('Link title'), 'New');
        await userEvent.click(screen.getByRole('button', {name: /Save/}));

        await waitFor(() => expect(saved).toEqual([{
            method: 'PUT',
            body: {id: 'l1', title: 'New', url: 'https://x.dev', tags: ['t1'], collections: ['c1'], process: false},
        }]));
        expect(await screen.findByText('Link updated')).toBeInTheDocument();
    });

    it('warns about links already saved', async () => {
        server.use(http.post('/api/link/checkExisting', () => HttpResponse.json([
            slimLink({id: 'd1', title: 'Saved before'}),
            slimLink({id: 'd2', title: '', source: 'example.com'}),
        ])));
        renderWithProviders(<LinkForm/>);

        await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com/post');

        expect(await screen.findByText('You have already saved this link 2 times', {}, {timeout: 2000})).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'Saved before'})).toHaveAttribute('href', '/links/d1');
        expect(screen.getByRole('link', {name: 'example.com'})).toHaveAttribute('href', '/links/d2');
    });

    it('does not count the link being edited as a duplicate', async () => {
        let checked = false;
        server.use(http.post('/api/link/checkExisting', () => {
            checked = true;
            return HttpResponse.json([slimLink({id: 'l1'})]);
        }));
        renderWithProviders(<LinkForm entry={link({id: 'l1', url: 'https://x.dev'})}/>);

        await new Promise((r) => setTimeout(r, 600));

        expect(checked).toBe(false);
        expect(screen.queryByText(/already saved/)).not.toBeInTheDocument();
    });

    it('fills the form from a suggestion', async () => {
        let posted = '';
        server.use(http.post('/api/suggest', async ({request}) => {
            posted = await request.text();
            return HttpResponse.json({
                url: posted, title: 'Suggested title', thumbnail: 'thumb.png', preview: null,
                keywords: ['async', 'tokio'], tags: [tag({id: 't1', name: 'rust'})], collections: [],
            });
        }));
        captureSave('link');
        renderWithProviders(<LinkForm/>);

        await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://tokio.rs');
        await userEvent.click(screen.getByRole('img', {name: 'bulb'}));

        await waitFor(() => expect(screen.getByPlaceholderText('Link title')).toHaveValue('Suggested title'));
        expect(posted).toBe('https://tokio.rs');
        expect(screen.getByText('tokio')).toBeInTheDocument();
        expect(screen.getByRole('img', {name: 'Thumbnail'})).toHaveAttribute('src', '/api/temp/thumb.png');

        await userEvent.click(screen.getByRole('button', {name: /Create Link/}));
        await waitFor(() => expect(saved[0].body).toMatchObject({tags: ['t1']}));
    });

    it('explains when no suggestion is available', async () => {
        server.use(http.post('/api/suggest', () => HttpResponse.json({message: 'Site blocks scraping'}, {status: 422})));
        renderWithProviders(<LinkForm/>);

        await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://blocked.dev');
        await userEvent.click(screen.getByRole('img', {name: 'bulb'}));

        expect(await screen.findByText('Site blocks scraping')).toBeInTheDocument();
    });

    it('reports a save failure', async () => {
        server.use(http.post('/api/link', () => HttpResponse.json({message: 'Duplicate URL'}, {status: 409})));
        const onSuccess = vi.fn();
        renderWithProviders(<LinkForm onSuccess={onSuccess}/>);

        await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://x.dev');
        await userEvent.type(screen.getByPlaceholderText('Link title'), 'X');
        await userEvent.click(screen.getByRole('button', {name: /Create Link/}));

        expect(await screen.findByText('Duplicate URL')).toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('cancels', async () => {
        const onCancel = vi.fn();
        renderWithProviders(<LinkForm onCancel={onCancel}/>);
        await userEvent.click(screen.getByRole('button', {name: 'Cancel'}));
        expect(onCancel).toHaveBeenCalled();
    });
});

describe('NoteForm', () => {
    it('requires a title', async () => {
        renderWithProviders(<NoteForm/>);
        await userEvent.click(screen.getByRole('button', {name: /Create Note/}));
        expect(await screen.findByText('Give the note a title')).toBeInTheDocument();
    });

    it('creates a note with its markdown and groups', async () => {
        captureSave('note');
        const onSuccess = vi.fn();
        const onDirtyChange = vi.fn();
        renderWithProviders(<NoteForm onSuccess={onSuccess} onDirtyChange={onDirtyChange}/>);

        await userEvent.type(screen.getByPlaceholderText('Untitled note'), 'Plans');
        await userEvent.type(screen.getByLabelText('Editor'), '# Heading');
        expect(onDirtyChange).toHaveBeenCalledWith(true);
        await userEvent.click(screen.getAllByRole('combobox')[0]);
        await userEvent.click(await screen.findByTitle('rust'));
        await userEvent.click(screen.getByRole('button', {name: /Create Note/}));

        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('saved1'));
        expect(saved[0]).toEqual({method: 'POST', body: {title: 'Plans', content: '# Heading', tags: ['t1'], collections: []}});
    });

    it('edits an existing note from its plain markdown', async () => {
        captureSave('note', {id: 'n1'});
        renderWithProviders(<NoteForm entry={note({id: 'n1', title: 'T', plainContent: 'old body'})}/>);

        expect(screen.getByLabelText('Editor')).toHaveValue('old body');
        await userEvent.type(screen.getByLabelText('Editor'), ' more');
        await userEvent.click(screen.getByRole('button', {name: /Save/}));

        await waitFor(() => expect(saved[0]).toEqual({
            method: 'PUT',
            body: {id: 'n1', title: 'T', content: 'old body more', tags: [], collections: []},
        }));
        expect(await screen.findByText('Note updated')).toBeInTheDocument();
    });
});

describe('SnippetForm', () => {
    it('cannot be saved empty', async () => {
        renderWithProviders(<SnippetForm/>);
        expect(screen.getByRole('button', {name: /Create Snippet/})).toBeDisabled();

        await userEvent.type(screen.getByLabelText('Editor'), '   ');
        expect(screen.getByRole('button', {name: /Create Snippet/})).toBeDisabled();
    });

    it('creates and updates', async () => {
        captureSave('snippet', {id: 's1'});
        const {unmount} = renderWithProviders(<SnippetForm/>);
        await userEvent.type(screen.getByLabelText('Editor'), 'let x = 1;');
        await userEvent.click(screen.getByRole('button', {name: /Create Snippet/}));
        expect(await screen.findByText('Snippet created')).toBeInTheDocument();
        unmount();

        renderWithProviders(<SnippetForm entry={snippet({id: 's1', plainContent: 'a'})}/>);
        await userEvent.click(screen.getByRole('button', {name: /Save/}));
        await waitFor(() => expect(saved).toEqual([
            {method: 'POST', body: {content: 'let x = 1;', tags: [], collections: []}},
            {method: 'PUT', body: {id: 's1', content: 'a', tags: [], collections: []}},
        ]));
    });
});

describe('FileForm', () => {
    it('needs a file, names the entry after it, then uploads it to the new entry', async () => {
        captureSave('file', {id: 'f1'});
        vi.mocked(uploadResource).mockResolvedValue(resource());
        const onSuccess = vi.fn();
        const {container} = renderWithProviders(<FileForm onSuccess={onSuccess}/>);
        expect(screen.getByRole('button', {name: /Create File/})).toBeDisabled();

        await userEvent.upload(container.querySelector<HTMLInputElement>('input[type=file]')!, new File(['%PDF'], 'report.final.pdf'));

        expect(screen.getByPlaceholderText('File title')).toHaveValue('report.final');
        await userEvent.click(screen.getByRole('button', {name: /Create File/}));

        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('f1'));
        expect(saved[0].body).toEqual({title: 'report.final', tags: [], collections: []});
        expect(uploadResource).toHaveBeenCalledWith('f1', expect.objectContaining({name: 'report.final.pdf'}));
        expect(await screen.findByText('File created')).toBeInTheDocument();
    });

    it('reports a failed upload rather than claiming success', async () => {
        captureSave('file', {id: 'f1'});
        vi.mocked(uploadResource).mockRejectedValue(apiError(413, {message: 'Too large'}));
        const onSuccess = vi.fn();
        const {container} = renderWithProviders(<FileForm onSuccess={onSuccess}/>);

        await userEvent.upload(container.querySelector<HTMLInputElement>('input[type=file]')!, new File(['x'], 'big.bin'));
        await userEvent.click(screen.getByRole('button', {name: /Create File/}));

        expect(await screen.findByText('Too large')).toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('edits only the title of an existing file', async () => {
        captureSave('file', {id: 'f1'});
        renderWithProviders(<FileForm entry={fileEntry({id: 'f1', title: 'Old'})}/>);

        expect(screen.queryByText('Click or drag a file here')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', {name: /Save/}));

        await waitFor(() => expect(saved[0]).toEqual({method: 'PUT', body: {id: 'f1', title: 'Old', tags: [], collections: []}}));
    });
});
