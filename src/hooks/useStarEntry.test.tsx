import {describe, expect, it} from 'vitest';
import {act, screen, waitFor} from '@testing-library/react';
import {delay, http, HttpResponse} from 'msw';
import type {QueryClient} from '@tanstack/react-query';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {digest, link, page, slimLink, slimNote} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import type {AnyEntry, AnySlimEntry, Digest, Page} from '@/types';
import {useStarEntry} from './useStarEntry';

const LIST_KEY = [...QK.entries(), 'list', 'page-1'];

function seed(queryClient: QueryClient) {
    queryClient.setQueryData(LIST_KEY, page<AnySlimEntry>([slimLink({id: 'l1'}), slimNote({id: 'n1'})]));
    queryClient.setQueryData(QK.entry('l1'), link({id: 'l1'}));
    queryClient.setQueryData(QK.digest(), digest({links: [slimLink({id: 'l1'}), slimLink({id: 'l2'})]}));
}

function starredIn(queryClient: QueryClient) {
    return {
        list: queryClient.getQueryData<Page<AnySlimEntry>>(LIST_KEY)!.content.map((e) => [e.id, e.starred]),
        detail: queryClient.getQueryData<AnyEntry>(QK.entry('l1'))!.starred,
        digest: queryClient.getQueryData<Digest>(QK.digest())!.links.map((l) => [l.id, l.starred]),
    };
}

describe('useStarEntry', () => {
    it('stars optimistically across list, detail and digest caches', async () => {
        server.use(http.post('/api/entry/l1/star', async () => {
            await delay('infinite');
            return HttpResponse.json({});
        }));
        const {result, queryClient} = renderHookWithProviders(() => useStarEntry());
        seed(queryClient);

        act(() => result.current.toggleStar('l1', false));

        await waitFor(() => expect(starredIn(queryClient)).toEqual({
            list: [['l1', true], ['n1', false]],
            detail: true,
            digest: [['l1', true], ['l2', false]],
        }));
    });

    it('calls unstar for a starred entry', async () => {
        let called = false;
        server.use(http.post('/api/entry/l1/unstar', () => {
            called = true;
            return HttpResponse.json({});
        }));
        const {result, queryClient} = renderHookWithProviders(() => useStarEntry());
        seed(queryClient);
        queryClient.setQueryData(QK.entry('l1'), link({id: 'l1', starred: true}));

        act(() => result.current.toggleStar('l1', true));

        await waitFor(() => expect(called).toBe(true));
        expect(starredIn(queryClient).detail).toBe(false);
    });

    it('rolls back every cache and reports the error on failure', async () => {
        server.use(http.post('/api/entry/l1/star', () => HttpResponse.json({message: 'Nope'}, {status: 500})));
        const {result, queryClient} = renderHookWithProviders(() => useStarEntry());
        seed(queryClient);

        act(() => result.current.toggleStar('l1', false));

        expect(await screen.findByText('Nope')).toBeInTheDocument();
        expect(starredIn(queryClient)).toEqual({
            list: [['l1', false], ['n1', false]],
            detail: false,
            digest: [['l1', false], ['l2', false]],
        });
    });

    it('tolerates caches that were never loaded', async () => {
        server.use(http.post('/api/entry/l1/star', () => HttpResponse.json({})));
        const {result, queryClient} = renderHookWithProviders(() => useStarEntry());

        act(() => result.current.toggleStar('l1', false));

        await waitFor(() => expect(result.current.isStarring).toBe(false));
        expect(queryClient.getQueryData(QK.entry('l1'))).toBeUndefined();
    });
});
