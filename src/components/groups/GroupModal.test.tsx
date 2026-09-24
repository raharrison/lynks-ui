import {describe, expect, it, vi} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {collection} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import GroupModal from './GroupModal';

function capture(path: string) {
    const writes: { method: string; body: unknown }[] = [];
    const handler = async ({request}: { request: Request }) => {
        writes.push({method: request.method, body: await request.json()});
        return HttpResponse.json({});
    };
    server.use(http.post(path, handler), http.put(path, handler));
    return writes;
}

const tree = [
    collection({
        id: 'root', name: 'Root', children: [
            collection({id: 'self', name: 'Self', children: [collection({id: 'child', name: 'Child'})]}),
            collection({id: 'sibling', name: 'Sibling'}),
        ]
    }),
];

describe('GroupModal', () => {
    it('will not save a blank name', async () => {
        const writes = capture('/api/tag');
        renderWithProviders(<GroupModal type="tag" open onClose={vi.fn()}/>);

        await userEvent.type(screen.getByPlaceholderText('Name'), '   ');
        await userEvent.click(screen.getByRole('button', {name: 'OK'}));

        expect(await screen.findByText('Please enter a name')).toBeInTheDocument();
        expect(writes).toEqual([]);
    });

    it('creates a tag with a trimmed name, refreshes tags and closes', async () => {
        const writes = capture('/api/tag');
        const onClose = vi.fn();
        const {queryClient} = renderWithProviders(<GroupModal type="tag" open onClose={onClose}/>);
        queryClient.setQueryData(QK.tags(), []);

        await userEvent.type(screen.getByPlaceholderText('Name'), '  rust {Enter}');

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(writes).toEqual([{method: 'POST', body: {name: 'rust'}}]);
        expect(queryClient.getQueryState(QK.tags())!.isInvalidated).toBe(true);
        expect(await screen.findByText('Tag created')).toBeInTheDocument();
    });

    it('creates a collection under a parent', async () => {
        const writes = capture('/api/collection');
        renderWithProviders(<GroupModal type="collection" open onClose={vi.fn()} collections={tree}/>);

        await userEvent.type(screen.getByPlaceholderText('Name'), 'Reading');
        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(await screen.findByTitle('Sibling'));
        await userEvent.click(screen.getByRole('button', {name: 'OK'}));

        await waitFor(() => expect(writes).toEqual([{method: 'POST', body: {name: 'Reading', parentId: 'sibling'}}]));
    });

    it('never offers a collection, or its descendants, as its own parent', async () => {
        renderWithProviders(<GroupModal type="collection" open onClose={vi.fn()} collections={tree}
                                        editItem={{id: 'self', name: 'Self', parentId: 'root'}}/>);

        await userEvent.click(screen.getByRole('combobox'));

        expect(await screen.findByTitle('Sibling')).toBeInTheDocument();
        expect(screen.queryByTitle('Self')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Child')).not.toBeInTheDocument();
    });

    it('updates an existing collection, keeping its parent', async () => {
        const writes = capture('/api/collection');
        renderWithProviders(<GroupModal type="collection" open onClose={vi.fn()} collections={tree}
                                        editItem={{id: 'self', name: 'Self', parentId: 'root'}}/>);

        expect(screen.getByText('Edit Collection')).toBeInTheDocument();
        await userEvent.clear(screen.getByPlaceholderText('Name'));
        await userEvent.type(screen.getByPlaceholderText('Name'), 'Renamed');
        await userEvent.click(screen.getByRole('button', {name: 'OK'}));

        await waitFor(() => expect(writes).toEqual([{method: 'PUT', body: {id: 'self', name: 'Renamed', parentId: 'root'}}]));
    });

    it('reports a failure and stays open', async () => {
        server.use(http.post('/api/tag', () => HttpResponse.json({message: 'Tag exists'}, {status: 409})));
        const onClose = vi.fn();
        renderWithProviders(<GroupModal type="tag" open onClose={onClose}/>);

        await userEvent.type(screen.getByPlaceholderText('Name'), 'rust{Enter}');

        expect(await screen.findByText('Tag exists')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });
});
