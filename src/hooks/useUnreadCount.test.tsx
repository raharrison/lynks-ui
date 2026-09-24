import {beforeEach, describe, expect, it} from 'vitest';
import {act, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import type {QueryClient} from '@tanstack/react-query';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {notification, page} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import type {Notification} from '@/types';
import {useUnreadCount} from './useUnreadCount';

let unread = 0;
let newest: Notification[] = [];
let requestedSize: string | null = null;
let markedRead: string[] = [];

beforeEach(() => {
    unread = 0;
    newest = [];
    requestedSize = null;
    markedRead = [];
    server.use(
        http.get('/api/notifications/unread', () => HttpResponse.json({unread})),
        http.get('/api/notifications', ({request}) => {
            requestedSize = new URL(request.url).searchParams.get('size');
            return HttpResponse.json(page(newest));
        }),
        http.post('/api/notifications/:id/read', ({params}) => {
            markedRead.push(params.id as string);
            return new HttpResponse(null, {status: 204});
        }),
    );
});

async function firstPoll(queryClient: QueryClient) {
    await waitFor(() => expect(queryClient.getQueryState(QK.unread())?.status).toBe('success'));
}

async function poll(queryClient: QueryClient) {
    await act(() => queryClient.refetchQueries({queryKey: QK.unread()}));
}

describe('useUnreadCount', () => {
    it('reports the count without toasting notifications that were unread at load', async () => {
        unread = 4;
        newest = [notification({message: 'Old news'})];
        const {result} = renderHookWithProviders(() => useUnreadCount());

        await waitFor(() => expect(result.current.unread).toBe(4));
        expect(requestedSize).toBeNull();
        expect(screen.queryByText('Old news')).not.toBeInTheDocument();
    });

    it('toasts only as many new notifications as arrived', async () => {
        unread = 1;
        const {queryClient} = renderHookWithProviders(() => useUnreadCount());
        await firstPoll(queryClient);

        unread = 3;
        newest = [
            notification({id: 'a', message: 'First new', entryTitle: 'Entry A'}),
            notification({id: 'b', message: 'Second new', entryTitle: null}),
        ];
        await poll(queryClient);

        expect(await screen.findByText('First new')).toBeInTheDocument();
        expect(screen.getByText('Entry A')).toBeInTheDocument();
        expect(screen.getByText('Second new')).toBeInTheDocument();
        expect(screen.getByText('Notification')).toBeInTheDocument();
        expect(requestedSize).toBe('2');
    });

    it('does not toast when the count falls', async () => {
        unread = 5;
        const {result, queryClient} = renderHookWithProviders(() => useUnreadCount());
        await firstPoll(queryClient);

        unread = 2;
        await poll(queryClient);

        await waitFor(() => expect(result.current.unread).toBe(2));
        expect(requestedSize).toBeNull();
    });

    it('caps the toasts and summarises the rest', async () => {
        const {queryClient} = renderHookWithProviders(() => useUnreadCount());
        await firstPoll(queryClient);

        unread = 7;
        newest = ['1', '2', '3'].map((id) => notification({id, message: `Message ${id}`}));
        await poll(queryClient);

        expect(await screen.findByText('4 more notifications')).toBeInTheDocument();
        expect(requestedSize).toBe('3');
    });

    it('skips notifications already read by the time they are fetched', async () => {
        const {queryClient} = renderHookWithProviders(() => useUnreadCount());
        await firstPoll(queryClient);

        unread = 2;
        newest = [notification({id: 'a', message: 'Unread one'}), notification({id: 'b', message: 'Read one', read: true})];
        await poll(queryClient);

        expect(await screen.findByText('Unread one')).toBeInTheDocument();
        expect(screen.queryByText('Read one')).not.toBeInTheDocument();
    });

    it('opens the entry and marks it read when a toast is clicked', async () => {
        const {queryClient, location} = renderHookWithProviders(() => useUnreadCount());
        await firstPoll(queryClient);

        unread = 1;
        newest = [notification({id: 'n9', entryId: 'e9', message: 'Click me'})];
        await poll(queryClient);
        await userEvent.click(await screen.findByText('Click me'));

        await waitFor(() => expect(location().pathname).toBe('/entry/e9'));
        await waitFor(() => expect(markedRead).toEqual(['n9']));
    });

    it('opens the notifications page from the summary toast', async () => {
        const {queryClient, location} = renderHookWithProviders(() => useUnreadCount());
        await firstPoll(queryClient);

        unread = 4;
        newest = ['1', '2', '3'].map((id) => notification({id}));
        await poll(queryClient);
        await userEvent.click(await screen.findByText('1 more notifications'));

        expect(location().pathname).toBe('/notifications');
    });
});
