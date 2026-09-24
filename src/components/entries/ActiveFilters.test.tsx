import {beforeEach, describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {collection, tag} from '@/test/fixtures';
import ActiveFilters from './ActiveFilters';

beforeEach(() => {
    server.use(
        http.get('/api/tag', () => HttpResponse.json([
            tag({id: 't1', name: 'Dev', children: [tag({id: 't2', name: 'Rust'})]}),
        ])),
        http.get('/api/collection', () => HttpResponse.json([collection({id: 'c1', name: 'Reading'})])),
    );
});

function closeChip(label: string) {
    const chip = screen.getByText(label).closest('.ant-tag')!;
    return userEvent.click(chip.querySelector('.ant-tag-close-icon')!);
}

describe('ActiveFilters', () => {
    it('renders nothing without filters', () => {
        renderWithProviders(<ActiveFilters/>, {route: '/?sort=title'});
        expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    });

    it('labels tags and collections with their full path', async () => {
        renderWithProviders(<ActiveFilters/>, {route: '/?tags=t2&collections=c1'});
        expect(await screen.findByText('Dev / Rust')).toBeInTheDocument();
        expect(screen.getByText('Reading')).toBeInTheDocument();
    });

    it('falls back to the id for an unknown group', async () => {
        renderWithProviders(<ActiveFilters/>, {route: '/?tags=gone'});
        expect(await screen.findByText('gone')).toBeInTheDocument();
    });

    it('removes one tag and keeps the other filters', async () => {
        const {location} = renderWithProviders(<ActiveFilters/>, {route: '/notes?tags=t1,t2&q=async&sort=title&page=3'});
        await screen.findByText('Dev / Rust');

        await closeChip('Dev / Rust');

        expect(location().pathname).toBe('/notes');
        expect(Object.fromEntries(new URLSearchParams(location().search))).toEqual({tags: 't1', q: 'async', sort: 'title'});
    });

    it('removes the search and the source', async () => {
        const {location} = renderWithProviders(<ActiveFilters/>, {route: '/?q=async&source=hn'});

        await closeChip('Search: async');
        expect(location().search).toBe('?source=hn');

        await closeChip('hn');
        expect(location().search).toBe('');
    });

    it('clears everything but stays on the same list', async () => {
        const {location} = renderWithProviders(<ActiveFilters/>, {route: '/links?tags=t1&q=x&source=hn'});

        await userEvent.click(screen.getByText('Clear all'));

        expect(location().pathname).toBe('/links');
        expect(location().search).toBe('');
    });
});
