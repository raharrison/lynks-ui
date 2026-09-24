import {describe, expect, it, vi} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {mutationsSettled} from '@/test/mutations';
import {resource} from '@/test/fixtures';
import {uploadResource} from '@/api/resources';
import EntryResources from './EntryResources';

// jsdom FormData holding a File cannot cross Vitest's fetch bridge, so uploads are asserted at the api call
vi.mock('@/api/resources', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/api/resources')>(),
    uploadResource: vi.fn(),
}));

describe('EntryResources', () => {
    it('lists resources with previews for images and links to the viewer', async () => {
        server.use(http.get('/api/entry/l1/resource', () => HttpResponse.json([
            resource({id: 'r1', name: 'shot.PNG', extension: 'PNG', size: 2048, version: 2}),
            resource({id: 'r2', name: 'page.html', extension: 'html', type: 'page'}),
        ])));
        renderWithProviders(<EntryResources entryId="l1" entryType="link"/>);

        expect(await screen.findByText('Resources (2)')).toBeInTheDocument();
        expect(screen.getByRole('img', {name: 'shot.PNG'})).toHaveAttribute('src', '/api/entry/l1/resource/r1');
        expect(screen.queryByRole('img', {name: 'page.html'})).not.toBeInTheDocument();
        expect(screen.getByText(/2 KB · v2/)).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /page\.html/})).toHaveAttribute('href', '/links/l1/resource/r2');
    });

    it('deletes a resource after confirmation without opening it', async () => {
        let deleted = false;
        server.use(
            http.get('/api/entry/l1/resource', () => HttpResponse.json(deleted ? [] : [resource({id: 'r1', name: 'a.png'})])),
            http.delete('/api/entry/l1/resource/r1', () => {
                deleted = true;
                return new HttpResponse(null, {status: 204});
            }),
        );
        const {location} = renderWithProviders(<EntryResources entryId="l1" entryType="link"/>);

        await userEvent.click(await screen.findByRole('button', {name: 'Delete a.png'}));
        await userEvent.click(await screen.findByRole('button', {name: 'Delete'}));

        expect(await screen.findByText('Resource deleted')).toBeInTheDocument();
        expect(await screen.findByText('Resources (0)')).toBeInTheDocument();
        expect(location().pathname).toBe('/');
    });

    it('uploads each chosen file and refreshes the list', async () => {
        let uploaded = false;
        server.use(http.get('/api/entry/l1/resource', () => HttpResponse.json(uploaded ? [resource({name: 'new.png'})] : [])));
        vi.mocked(uploadResource).mockImplementation(async () => {
            uploaded = true;
            return resource();
        });
        const {container} = renderWithProviders(<EntryResources entryId="l1" entryType="link"/>);
        await screen.findByText('Resources (0)');

        await userEvent.upload(container.querySelector<HTMLInputElement>('input[type=file]')!, [
            new File(['a'], 'a.png'), new File(['b'], 'b.png'),
        ]);

        expect(await screen.findByText('Resources (1)')).toBeInTheDocument();
        expect(vi.mocked(uploadResource).mock.calls.map(([id, file]) => [id, file.name])).toEqual([['l1', 'a.png'], ['l1', 'b.png']]);
        expect(screen.getAllByText('File uploaded successfully')).not.toHaveLength(0);
    });

    it('reports a failed delete once', async () => {
        server.use(
            http.get('/api/entry/l1/resource', () => HttpResponse.json([resource({id: 'r1', name: 'a.png'})])),
            http.delete('/api/entry/l1/resource/r1', () => HttpResponse.json({message: 'In use'}, {status: 409})),
        );
        const {queryClient} = renderWithProviders(<EntryResources entryId="l1" entryType="link"/>);

        await userEvent.click(await screen.findByRole('button', {name: 'Delete a.png'}));
        await userEvent.click(await screen.findByRole('button', {name: 'Delete'}));

        expect(await screen.findByText('In use')).toBeInTheDocument();
        await mutationsSettled(queryClient);
        expect(screen.getAllByText('In use')).toHaveLength(1);
    });

    it('shows empty and error states', async () => {
        server.use(http.get('/api/entry/l1/resource', () => HttpResponse.json([])));
        const {unmount} = renderWithProviders(<EntryResources entryId="l1" entryType="link"/>);
        expect(await screen.findByText(/No resources/)).toBeInTheDocument();
        unmount();

        server.use(http.get('/api/entry/l2/resource', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<EntryResources entryId="l2" entryType="link"/>);
        expect(await screen.findByText('Failed to load resources')).toBeInTheDocument();
    });
});
