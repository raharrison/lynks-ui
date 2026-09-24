import {beforeEach, describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import {recurringReminder, user} from '@/test/fixtures';
import ReminderSection from './ReminderSection';

beforeEach(() => {
    server.use(http.get('/api/user', () => HttpResponse.json(user())));
});

describe('ReminderSection', () => {
    it('lists the entry\'s reminders and opens the form to add one', async () => {
        server.use(http.get('/api/entry/l1/reminder', () => HttpResponse.json([recurringReminder({message: 'Weekly check'})])));
        renderWithProviders(<ReminderSection entryId="l1"/>);

        expect(await screen.findByText('Reminders (1)')).toBeInTheDocument();
        expect(screen.getByText('Weekly check')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: /Add/}));
        expect(await screen.findByText('New Reminder')).toBeInTheDocument();
    });

    it('says when there are none', async () => {
        server.use(http.get('/api/entry/l1/reminder', () => HttpResponse.json([])));
        renderWithProviders(<ReminderSection entryId="l1"/>);
        expect(await screen.findByText('No reminders')).toBeInTheDocument();
    });
});
