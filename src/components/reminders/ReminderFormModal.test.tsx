import {beforeEach, describe, expect, it, vi} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {adhocReminder, recurringReminder, user} from '@/test/fixtures';
import type {NewReminder} from '@/types';
import ReminderFormModal from './ReminderFormModal';

let saved: { method: string; body: NewReminder }[] = [];

beforeEach(() => {
    saved = [];
    const capture = async ({request}: { request: Request }) => {
        saved.push({method: request.method, body: await request.json() as NewReminder});
        return HttpResponse.json({});
    };
    server.use(
        http.get('/api/user', () => HttpResponse.json(user({joltConfigured: false}))),
        http.post('/api/reminder', capture),
        http.put('/api/reminder', capture),
        http.post('/api/reminder/preview', () => HttpResponse.json(['2026-02-01T09:00:00Z'])),
    );
});

describe('ReminderFormModal', () => {
    it('requires a time for a one-time reminder', async () => {
        renderWithProviders(<ReminderFormModal open onClose={vi.fn()} entryId="l1"/>);

        await userEvent.click(screen.getByRole('button', {name: 'Create'}));

        expect(await screen.findByText('Choose when to be reminded')).toBeInTheDocument();
        expect(saved).toEqual([]);
    });

    it('creates a recurring reminder from the schedule builder', async () => {
        const onClose = vi.fn();
        renderWithProviders(<ReminderFormModal open onClose={onClose} entryId="l1"/>);

        await userEvent.click(screen.getByText('Recurring'));
        await userEvent.click(await screen.findByText('Weekly'));
        await userEvent.type(screen.getByPlaceholderText('Optional reminder message'), 'Review');
        await userEvent.click(screen.getByRole('button', {name: 'Create'}));

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(saved).toHaveLength(1);
        expect(saved[0].method).toBe('POST');
        expect(saved[0].body).toEqual({
            entryId: 'l1',
            type: 'recurring',
            schedule: {kind: 'calendar', at: '09:00', weekdays: ['monday']},
            message: 'Review',
            notifyMethods: ['push'],
            tz: expect.any(String),
            status: 'active',
        });
        expect(await screen.findByText('Reminder created')).toBeInTheDocument();
    });

    it('will not save an unfinished schedule', async () => {
        renderWithProviders(<ReminderFormModal open onClose={vi.fn()} entryId="l1"/>);

        await userEvent.click(screen.getByText('Recurring'));
        await userEvent.click(await screen.findByText('Weekly'));
        await userEvent.click(screen.getByRole('checkbox', {name: 'Mon'}));
        await userEvent.click(screen.getByRole('button', {name: 'Create'}));

        expect(await screen.findByText('Finish choosing the schedule')).toBeInTheDocument();
        expect(saved).toEqual([]);
    });

    it('only offers jolt once a token is configured', async () => {
        const {unmount} = renderWithProviders(<ReminderFormModal open onClose={vi.fn()} entryId="l1"/>);
        expect(await screen.findByText('Set your Jolt token under Settings to use Jolt')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('combobox'));
        expect(await screen.findByTitle('Jolt')).toHaveClass('ant-select-item-option-disabled');
        unmount();

        server.use(http.get('/api/user', () => HttpResponse.json(user({joltConfigured: true}))));
        renderWithProviders(<ReminderFormModal open onClose={vi.fn()} entryId="l1"/>);
        await waitFor(() => expect(screen.queryByText(/Set your Jolt token/)).not.toBeInTheDocument());
        await userEvent.click(screen.getByRole('combobox'));
        expect(await screen.findByTitle('Jolt')).not.toHaveClass('ant-select-item-option-disabled');
    });

    it('edits an existing reminder in place', async () => {
        const reminder = recurringReminder({
            reminderId: 'r1',
            message: 'Old',
            schedule: {kind: 'interval', every: 2, unit: 'hours'}
        });
        renderWithProviders(<ReminderFormModal open onClose={vi.fn()} entryId="l1" reminder={reminder}/>);

        expect(screen.getByText('Edit Reminder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Optional reminder message')).toHaveValue('Old');
        await userEvent.click(screen.getByRole('button', {name: 'Save'}));

        await waitFor(() => expect(saved).toHaveLength(1));
        expect(saved[0]).toMatchObject({
            method: 'PUT',
            body: {reminderId: 'r1', type: 'recurring', schedule: {kind: 'interval', every: 2, unit: 'hours'}, status: 'active'},
        });
    });

    it('keeps a paused reminder paused and revives a completed one', async () => {
        const {unmount} = renderWithProviders(
            <ReminderFormModal open onClose={vi.fn()} entryId="l1" reminder={adhocReminder({status: 'disabled'})}/>);
        await userEvent.click(screen.getByRole('button', {name: 'Save'}));
        await waitFor(() => expect(saved).toHaveLength(1));
        unmount();

        renderWithProviders(<ReminderFormModal open onClose={vi.fn()} entryId="l1"
                                               reminder={adhocReminder({status: 'completed'})}/>);
        await userEvent.click(screen.getByRole('button', {name: 'Save'}));
        await waitFor(() => expect(saved).toHaveLength(2));

        expect(saved.map((s) => s.body.status)).toEqual(['disabled', 'active']);
        expect(saved[0].body.fireAt).toBe(Date.parse('2099-01-01T09:00:00Z'));
    });

    it('rejects a one-time reminder in the past', async () => {
        renderWithProviders(<ReminderFormModal open onClose={vi.fn()} entryId="l1"
                                               reminder={adhocReminder({fireAt: Date.parse('2001-01-01T00:00:00Z')})}/>);

        await userEvent.click(screen.getByRole('button', {name: 'Save'}));

        expect(await screen.findByText('Choose a time in the future')).toBeInTheDocument();
    });
});
