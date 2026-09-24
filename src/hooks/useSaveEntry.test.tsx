import {describe, expect, it} from 'vitest';
import {act} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {link, page} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import {useSaveEntry} from './useSaveEntry';

const LIST = [...QK.entries(), 'list', 'a'];

describe('useSaveEntry', () => {
    it('creates with POST and invalidates the lists', async () => {
        let body: unknown;
        server.use(http.post('/api/link', async ({request}) => {
            body = await request.json();
            return HttpResponse.json(link({id: 'new'}));
        }));
        const {result, queryClient} = renderHookWithProviders(() => useSaveEntry('link'));
        queryClient.setQueryData(LIST, page([]));

        await act(() => result.current.mutateAsync({title: 'T', url: 'https://x.dev'}));

        expect(body).toEqual({title: 'T', url: 'https://x.dev'});
        expect(queryClient.getQueryState(LIST)!.isInvalidated).toBe(true);
        expect(queryClient.getQueryData(QK.entry('new'))).toBeUndefined();
    });

    it('updates with PUT and fills the detail cache from the response', async () => {
        const saved = link({id: 'l1', title: 'Renamed', version: 2});
        server.use(http.put('/api/link', () => HttpResponse.json(saved)));
        const {result, queryClient} = renderHookWithProviders(() => useSaveEntry('link', 'l1'));

        await act(() => result.current.mutateAsync({id: 'l1', title: 'Renamed', url: 'https://x.dev'}));

        expect(queryClient.getQueryData(QK.entry('l1'))).toEqual(saved);
    });

    it.each(['note', 'snippet', 'file'] as const)('routes %s saves to its own endpoint', async (type) => {
        let hit = false;
        server.use(http.post(`/api/${type}`, () => {
            hit = true;
            return HttpResponse.json({id: 'x', type});
        }));
        const {result} = renderHookWithProviders(() => useSaveEntry(type));

        await act(() => result.current.mutateAsync({title: 't', content: 'c'}));

        expect(hit).toBe(true);
    });
});
