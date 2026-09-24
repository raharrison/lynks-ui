import {describe, expect, it} from 'vitest';
import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {mutationsSettled} from '@/test/mutations';
import {notification, page} from '@/test/fixtures';
import type {Notification} from '@/types';
import NotificationsPage from './NotificationsPage';

function serve(items: Notification[], total = items.length) {
    const marked: string[] = [];
    server.use(
        http.get('/api/notifications', () => HttpResponse.json(page(items, {total}))),
        http.post('/api/notifications/:id/:action', ({params}) => {
            marked.push(`${params.id}:${params.action}`);
            return new HttpResponse(null, {status: 204});
        }),
    );
    return marked;
}

describe('NotificationsPage', () => {
    it('shows an empty state', async () => {
        serve([]);
        renderWithProviders(<NotificationsPage/>);
        expect(await screen.findByText('No notifications')).toBeInTheDocument();
    });

    it('shows an error state', async () => {
        server.use(http.get('/api/notifications', () => new HttpResponse(null, {status: 500})));
        renderWithProviders(<NotificationsPage/>);
        expect(await screen.findByText('Failed to load notifications')).toBeInTheDocument();
    });

    it('opens the entry and marks an unread notification read', async () => {
        const marked = serve([notification({id: 'n1', entryId: 'e1', message: 'Processed it'})]);
        const {location} = renderWithProviders(<NotificationsPage/>);

        await userEvent.click(await screen.findByText('Processed it'));

        expect(location().pathname).toBe('/entry/e1');
        await waitFor(() => expect(marked).toEqual(['n1:read']));
    });

    it('does not mark an already read notification again when opened', async () => {
        const marked = serve([notification({id: 'n1', entryId: 'e1', read: true, message: 'Old'})]);
        const {location} = renderWithProviders(<NotificationsPage/>);

        await userEvent.click(await screen.findByText('Old'));

        expect(location().pathname).toBe('/entry/e1');
        expect(marked).toEqual([]);
    });

    it('toggles read state without opening the entry', async () => {
        const marked = serve([
            notification({id: 'n1', message: 'Unread one'}),
            notification({id: 'n2', message: 'Read one', read: true}),
        ]);
        const {location} = renderWithProviders(<NotificationsPage/>);
        await screen.findByText('Unread one');

        const row = (text: string) => within(screen.getByText(text).closest('.notification-item') as HTMLElement);
        await userEvent.click(row('Unread one').getByRole('button', {name: 'Mark read'}));
        await userEvent.click(row('Read one').getByRole('button', {name: 'Mark unread'}));

        await waitFor(() => expect(marked).toEqual(['n1:read', 'n2:unread']));
        expect(location().pathname).toBe('/');
    });

    it('marks everything read and says how many', async () => {
        serve([notification()]);
        server.use(http.post('/api/notifications/markAllRead', () => HttpResponse.json({read: 7})));
        renderWithProviders(<NotificationsPage/>);
        await screen.findByText('Link processed');

        await userEvent.click(screen.getByRole('button', {name: /Mark all read/}));

        expect(await screen.findByText('Marked 7 notifications as read')).toBeInTheDocument();
    });

    it('reports a failed mark all once', async () => {
        serve([notification()]);
        server.use(http.post('/api/notifications/markAllRead', () => HttpResponse.json({message: 'Try later'}, {status: 503})));
        const {queryClient} = renderWithProviders(<NotificationsPage/>);
        await screen.findByText('Link processed');

        await userEvent.click(screen.getByRole('button', {name: /Mark all read/}));

        expect(await screen.findByText('Try later')).toBeInTheDocument();
        await mutationsSettled(queryClient);
        expect(screen.getAllByText('Try later')).toHaveLength(1);
    });

    it('paginates only when there is more than one page', async () => {
        serve([notification()], 45);
        renderWithProviders(<NotificationsPage/>);

        const pager = await screen.findByText('45 notifications');
        expect(within(pager.closest('ul')!).getByTitle('3')).toBeInTheDocument();
    });
});
