import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {resource} from '@/test/fixtures';
import type {Resource} from '@/types';
import ResourceViewerPage from './ResourceViewerPage';

function serve(res: Resource, body?: string) {
    server.use(
        http.get(`/api/entry/l1/resource/${res.id}/info`, () => HttpResponse.json(res)),
        http.get(`/api/entry/l1/resource/${res.id}`, () => new HttpResponse(body ?? '', {headers: {'Content-Type': 'text/plain'}})),
    );
}

function renderViewer(id = 'r1') {
    return renderWithProviders(<ResourceViewerPage/>, {
        route: `/links/l1/resource/${id}`,
        path: '/links/:entryId/resource/:resourceId',
    });
}

describe('ResourceViewerPage', () => {
    it('shows details and an image preview', async () => {
        serve(resource({id: 'r1', name: 'shot.png', extension: 'png', size: 1536, version: 2}));
        renderViewer();

        expect(await screen.findByRole('heading', {name: 'shot.png'})).toBeInTheDocument();
        expect(screen.getByRole('img', {name: 'shot.png'})).toHaveAttribute('src', '/api/entry/l1/resource/r1');
        expect(screen.getByText('1.5 KB')).toBeInTheDocument();
        expect(screen.getByText('v2')).toBeInTheDocument();
        expect(document.title).toBe('shot.png - Lynks');
    });

    it('renders a captured page in an iframe with an empty sandbox', async () => {
        serve(resource({id: 'r1', name: 'page.html', extension: 'html', type: 'single_file'}));
        renderViewer();

        const frame = await screen.findByTitle('page.html');
        expect(frame.tagName).toBe('IFRAME');
        expect(frame).toHaveAttribute('sandbox', '');
        expect(frame).toHaveAttribute('src', '/api/entry/l1/resource/r1');
    });

    it('sanitises other html before inlining it', async () => {
        serve(
            resource({id: 'r1', name: 'doc.html', extension: 'html', type: 'readable_doc'}),
            '<h1>Article</h1><script>window.pwned=1</script><img src="x" onerror="alert(1)"><iframe src="https://evil.test"></iframe>',
        );
        const {container} = renderViewer();

        expect(await screen.findByRole('heading', {name: 'Article'})).toBeInTheDocument();
        expect(container.querySelector('script')).toBeNull();
        expect(container.querySelector('[onerror]')).toBeNull();
        expect(container.querySelector('iframe')).toBeNull();
    });

    it('shows text files with the language detected from the extension', async () => {
        serve(resource({id: 'r1', name: 'main.rs', extension: 'rs', type: 'upload'}), 'fn main() {}');
        const {container} = renderViewer();

        expect(await screen.findByText('rust')).toBeInTheDocument();
        expect(container.querySelector('code.language-rust')).toHaveTextContent('fn main() {}');
    });

    it('reports a text file that fails to load', async () => {
        server.use(
            http.get('/api/entry/l1/resource/r1/info', () => HttpResponse.json(resource({extension: 'txt', name: 'a.txt'}))),
            http.get('/api/entry/l1/resource/r1', () => new HttpResponse(null, {status: 500})),
        );
        renderViewer();
        expect(await screen.findByText('Failed to load file content')).toBeInTheDocument();
    });

    it.each([
        ['clip.mp4', 'mp4', 'video'],
        ['song.mp3', 'mp3', 'audio'],
    ])('uses native controls for %s', async (name, extension, tag) => {
        serve(resource({id: 'r1', name, extension, type: 'upload'}));
        const {container} = renderViewer();

        await screen.findByRole('heading', {name});
        expect(container.querySelector(tag)).toHaveAttribute('src', '/api/entry/l1/resource/r1');
    });

    it('offers a download for files it cannot preview', async () => {
        serve(resource({id: 'r1', name: 'data.bin', extension: 'bin', type: 'upload'}));
        renderViewer();

        expect(await screen.findByText('Preview not available for .bin files')).toBeInTheDocument();
        expect(screen.getByText('No preview')).toBeInTheDocument();
    });

    it('renames on enter and ignores an unchanged name', async () => {
        const puts: unknown[] = [];
        serve(resource({id: 'r1', name: 'old.png'}));
        server.use(http.put('/api/entry/l1/resource', async ({request}) => {
            puts.push(await request.json());
            return HttpResponse.json({});
        }));
        renderViewer();

        await userEvent.click(await screen.findByRole('button', {name: /Rename/}));
        await userEvent.keyboard('{Enter}');
        expect(puts).toEqual([]);

        await userEvent.click(screen.getByRole('button', {name: /Rename/}));
        const input = screen.getByDisplayValue('old.png');
        await userEvent.clear(input);
        await userEvent.type(input, 'new.png{Enter}');

        expect(await screen.findByText('Resource renamed')).toBeInTheDocument();
        expect(puts).toEqual([expect.objectContaining({id: 'r1', name: 'new.png'})]);
    });

    it('cancels a rename with escape', async () => {
        serve(resource({id: 'r1', name: 'old.png'}));
        renderViewer();

        await userEvent.click(await screen.findByRole('button', {name: /Rename/}));
        await userEvent.type(screen.getByDisplayValue('old.png'), 'x{Escape}');

        expect(screen.getByRole('heading', {name: 'old.png'})).toBeInTheDocument();
    });

    it('deletes and returns to the entry', async () => {
        serve(resource({id: 'r1'}));
        server.use(http.delete('/api/entry/l1/resource/r1', () => new HttpResponse(null, {status: 204})));
        const {location} = renderViewer();
        await screen.findByRole('heading', {name: 'screenshot.png'});

        await userEvent.click(document.querySelector<HTMLElement>('.ant-btn-dangerous')!);
        await userEvent.click(await screen.findByRole('button', {name: 'Delete'}));

        await waitFor(() => expect(location().pathname).toBe('/links/l1'));
    });

    it('goes back to the entry', async () => {
        serve(resource({id: 'r1'}));
        const {location} = renderViewer();

        await userEvent.click(await screen.findByRole('button', {name: /Back to entry/}));

        expect(location().pathname).toBe('/links/l1');
    });

    it('shows not found', async () => {
        server.use(http.get('/api/entry/l1/resource/gone/info', () => new HttpResponse(null, {status: 404})));
        renderViewer('gone');
        expect(await screen.findByText('Resource not found')).toBeInTheDocument();
    });
});
