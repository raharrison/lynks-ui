import {describe, expect, it} from 'vitest';
import {act, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {link, page} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import {useRevertEntry} from './useRevertEntry';

const LIST = [...QK.entries(), 'list', 'a'];

describe('useRevertEntry', () => {
    it('replaces the detail cache, invalidates history and lists, and reports the new version', async () => {
        const reverted = link({id: 'l1', version: 5, title: 'Old title'});
        server.use(http.post('/api/link/l1/revert/2', () => HttpResponse.json(reverted)));
        const {result, queryClient} = renderHookWithProviders(() => useRevertEntry());
        queryClient.setQueryData(QK.history('l1'), []);
        queryClient.setQueryData(QK.audit('l1'), []);
        queryClient.setQueryData(LIST, page([]));

        act(() => result.current.revert({type: 'link', id: 'l1', version: 2}));

        expect(await screen.findByText('Restored version 2 as v5')).toBeInTheDocument();
        expect(queryClient.getQueryData(QK.entry('l1'))).toEqual(reverted);
        expect(queryClient.getQueryState(QK.history('l1'))!.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(QK.audit('l1'))!.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(LIST)!.isInvalidated).toBe(true);
    });

    it('reports a failure', async () => {
        server.use(http.post('/api/link/l1/revert/2', () => new HttpResponse(null, {status: 500})));
        const {result} = renderHookWithProviders(() => useRevertEntry());

        act(() => result.current.revert({type: 'link', id: 'l1', version: 2}));

        expect(await screen.findByText('Failed to restore version')).toBeInTheDocument();
    });
});
