import {describe, expect, it} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {adhocReminder, recurringReminder} from '@/test/fixtures';
import type {NewReminder} from '@/types';
import ReminderList from './ReminderList';

describe('ReminderList', () => {
    it('describes each reminder', () => {
        renderWithProviders(<ReminderList reminders={[
            adhocReminder({reminderId: 'a', message: 'Call back', fireAt: Date.parse('2099-03-04T15:07:00Z')}),
            recurringReminder({
                reminderId: 'b',
                message: null,
                schedule: {kind: 'interval', every: 2, unit: 'hours'},
                notifyMethods: ['push', 'jolt']
            }),
        ]}/>);

        expect(screen.getByText('Call back')).toBeInTheDocument();
        expect(screen.getByText('Mar 4, 2099 3:07 PM')).toBeInTheDocument();
        expect(screen.getByText('Recurring reminder')).toBeInTheDocument();
        expect(screen.getByText('Every 2 hours')).toBeInTheDocument();
        expect(screen.getByText('jolt')).toBeInTheDocument();
    });

    it('links to the entry only when asked', () => {
        const {unmount} = renderWithProviders(<ReminderList reminders={[adhocReminder({entryTitle: 'My link'})]}/>);
        expect(screen.queryByText('My link')).not.toBeInTheDocument();
        unmount();

        renderWithProviders(<ReminderList showEntry reminders={[adhocReminder({
            entryId: 'l1',
            entryType: 'link',
            entryTitle: 'My link'
        })]}/>);
        expect(screen.getByRole('link', {name: /My link/})).toHaveAttribute('href', '/links/l1');
    });

    it('pauses by saving the full reminder as disabled', async () => {
        let saved: NewReminder | undefined;
        server.use(http.put('/api/reminder', async ({request}) => {
            saved = await request.json() as NewReminder;
            return HttpResponse.json({});
        }));
        const reminder = recurringReminder({message: 'Stretch'});
        renderWithProviders(<ReminderList reminders={[reminder]}/>);

        await userEvent.click(screen.getByRole('button', {name: 'Pause'}));

        expect(await screen.findByText('Reminder paused')).toBeInTheDocument();
        expect(saved).toEqual({
            reminderId: reminder.reminderId,
            entryId: reminder.entryId,
            type: 'recurring',
            notifyMethods: ['push'],
            message: 'Stretch',
            tz: 'UTC',
            status: 'disabled',
            schedule: {kind: 'calendar', at: '09:00'},
        });
    });

    it('resumes a paused reminder', async () => {
        let status: string | undefined;
        server.use(http.put('/api/reminder', async ({request}) => {
            status = (await request.json() as NewReminder).status;
            return HttpResponse.json({});
        }));
        renderWithProviders(<ReminderList reminders={[recurringReminder({status: 'disabled'})]}/>);

        expect(screen.getByText('paused')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', {name: 'Resume'}));

        await waitFor(() => expect(status).toBe('active'));
    });

    it('will not resume a one-time reminder whose time has passed', () => {
        renderWithProviders(<ReminderList
            reminders={[adhocReminder({status: 'disabled', fireAt: Date.parse('2000-01-01T00:00:00Z')})]}/>);
        expect(screen.getByRole('button', {name: 'Resume'})).toBeDisabled();
    });

    it('offers neither pause nor resume once completed', () => {
        renderWithProviders(<ReminderList reminders={[adhocReminder({status: 'completed'})]}/>);
        expect(screen.queryByRole('button', {name: 'Pause'})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: 'Resume'})).not.toBeInTheDocument();
    });

    it('deletes after confirmation', async () => {
        let deleted = false;
        server.use(http.delete('/api/reminder/r1', () => {
            deleted = true;
            return new HttpResponse(null, {status: 204});
        }));
        renderWithProviders(<ReminderList reminders={[adhocReminder({reminderId: 'r1'})]}/>);

        await userEvent.click(screen.getByRole('button', {name: 'Delete'}));
        expect(deleted).toBe(false);
        await userEvent.click(await screen.findByRole('button', {name: 'OK'}));

        expect(await screen.findByText('Reminder deleted')).toBeInTheDocument();
        expect(deleted).toBe(true);
    });
});
