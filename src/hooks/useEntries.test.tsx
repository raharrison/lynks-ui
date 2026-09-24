import {describe, expect, it} from 'vitest';
import {waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {page, slimLink} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import {useEntries} from './useEntries';

describe('useEntries', () => {
    it.each([
        [null, '/api/entry'],
        ['link', '/api/link'],
        ['note', '/api/note'],
        ['snippet', '/api/snippet'],
        ['file', '/api/file'],
    ] as const)('lists %s entries from %s', async (entryType, path) => {
        server.use(http.get(path, () => HttpResponse.json(page([slimLink()]))));
        const {result} = renderHookWithProviders(() => useEntries({entryType, page: 1}));
        await waitFor(() => expect(result.current.data?.content).toHaveLength(1));
    });

    it('searches when there is a query, whatever the type', async () => {
        let q: string | null = null;
        server.use(http.get('/api/entry/search', ({request}) => {
            q = new URL(request.url).searchParams.get('q');
            return HttpResponse.json(page([]));
        }));
        const {result} = renderHookWithProviders(() => useEntries({entryType: 'note', searchQuery: 'hello'}));
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(q).toBe('hello');
    });

    it('keys lists under the entries prefix so mutations reach them', async () => {
        server.use(http.get('/api/entry', () => HttpResponse.json(page([]))));
        const {result, queryClient} = renderHookWithProviders(() => useEntries({tags: ['t1']}));
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(queryClient.getQueryCache().findAll({queryKey: QK.entries()})).toHaveLength(1);
    });
});
