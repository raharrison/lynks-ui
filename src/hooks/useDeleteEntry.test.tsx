import {describe, expect, it} from 'vitest';
import {act, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {link, page, slimLink, slimNote} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import type {AnySlimEntry, Page} from '@/types';
import {useDeleteEntry} from './useDeleteEntry';

const LIST_A = [...QK.entries(), 'list', 'a'];
const LIST_B = [...QK.entries(), 'list', 'b'];

describe('useDeleteEntry', () => {
    it('deletes by type and removes the entry from every list and its detail cache', async () => {
        server.use(http.delete('/api/note/n1', () => new HttpResponse(null, {status: 204})));
        const {result, queryClient} = renderHookWithProviders(() => useDeleteEntry());
        queryClient.setQueryData(LIST_A, page<AnySlimEntry>([slimNote({id: 'n1'}), slimLink({id: 'l1'})]));
        queryClient.setQueryData(LIST_B, page<AnySlimEntry>([slimNote({id: 'n1'})]));
        queryClient.setQueryData(QK.entry('n1'), link());

        act(() => result.current.deleteEntry({id: 'n1', type: 'note'}));

        await waitFor(() => expect(queryClient.getQueryData(QK.entry('n1'))).toBeUndefined());
        const a = queryClient.getQueryData<Page<AnySlimEntry>>(LIST_A)!;
        expect(a.content.map((e) => e.id)).toEqual(['l1']);
        expect(a.total).toBe(1);
        expect(queryClient.getQueryData<Page<AnySlimEntry>>(LIST_B)!.content).toEqual([]);
    });

    it('keeps the caches and reports the error on failure', async () => {
        server.use(http.delete('/api/link/l1', () => HttpResponse.json({message: 'Locked'}, {status: 409})));
        const {result, queryClient} = renderHookWithProviders(() => useDeleteEntry());
        queryClient.setQueryData(LIST_A, page<AnySlimEntry>([slimLink({id: 'l1'})]));

        act(() => result.current.deleteEntry({id: 'l1', type: 'link'}));

        expect(await screen.findByText('Locked')).toBeInTheDocument();
        expect(queryClient.getQueryData<Page<AnySlimEntry>>(LIST_A)!.content).toHaveLength(1);
    });
});
