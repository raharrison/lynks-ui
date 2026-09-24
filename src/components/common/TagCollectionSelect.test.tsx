import {beforeEach, describe, expect, it, vi} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {collection, tag} from '@/test/fixtures';
import TagCollectionSelect from './TagCollectionSelect';

beforeEach(() => {
    server.use(
        http.get('/api/tag', () => HttpResponse.json([
            tag({id: 't1', name: 'Rust', children: [tag({id: 't2', name: 'Async'})]}),
            tag({id: 't3', name: 'Go'}),
        ])),
        http.get('/api/collection', () => HttpResponse.json([collection({id: 'c1', name: 'Reading'})])),
    );
});

function setup() {
    const onTagsChange = vi.fn();
    const onCollectionsChange = vi.fn();
    renderWithProviders(<TagCollectionSelect selectedTags={[]} selectedCollections={[]}
                                             onTagsChange={onTagsChange} onCollectionsChange={onCollectionsChange}/>);
    const [tags, collections] = screen.getAllByRole('combobox');
    return {tags, collections, onTagsChange, onCollectionsChange};
}

describe('TagCollectionSelect', () => {
    it('offers nested groups by their full path', async () => {
        const {tags, onTagsChange} = setup();

        await userEvent.click(tags);
        await userEvent.click(await screen.findByTitle('Rust / Async'));

        expect(onTagsChange).toHaveBeenCalledWith(['t2'], expect.anything());
    });

    it('filters by name as you type, case insensitively', async () => {
        const {tags} = setup();

        await userEvent.type(tags, 'GO');

        expect(await screen.findByTitle('Go')).toBeInTheDocument();
        expect(screen.queryByTitle('Rust')).not.toBeInTheDocument();
    });

    it('picks collections separately', async () => {
        const {collections, onCollectionsChange, onTagsChange} = setup();

        await userEvent.click(collections);
        await userEvent.click(await screen.findByTitle('Reading'));

        expect(onCollectionsChange).toHaveBeenCalledWith(['c1'], expect.anything());
        expect(onTagsChange).not.toHaveBeenCalled();
    });
});
