import {describe, expect, it} from 'vitest';
import {act, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {notification, page} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import {useNotifications} from './useNotifications';

describe('useNotifications', () => {
    it('updates the read flag in place and refreshes the unread count', async () => {
        server.use(
            http.get('/api/notifications', () => HttpResponse.json(page([notification({id: 'n1', read: false})]))),
            http.post('/api/notifications/n1/read', () => new HttpResponse(null, {status: 204})),
        );
        const {result, queryClient} = renderHookWithProviders(() => useNotifications(1));
        queryClient.setQueryData(QK.unread(), {unread: 1});
        await waitFor(() => expect(result.current.notifications).toHaveLength(1));

        act(() => result.current.markRead({id: 'n1', read: true}));

        await waitFor(() => expect(result.current.notifications[0].read).toBe(true));
        expect(queryClient.getQueryState(QK.unread())!.isInvalidated).toBe(true);
    });
});
