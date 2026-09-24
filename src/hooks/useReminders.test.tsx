import {describe, expect, it} from 'vitest';
import {act, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderHookWithProviders} from '@/test/render';
import {adhocReminder, page, recurringReminder} from '@/test/fixtures';
import {QK} from '@/utils/queryKeys';
import {toNewReminder, useReminderMutations} from './useReminders';

describe('toNewReminder', () => {
    it('keeps fireAt for a one-time reminder and drops read-only fields', () => {
        const r = adhocReminder({message: null});
        const out = toNewReminder(r);
        expect(out).toEqual({
            reminderId: r.reminderId,
            entryId: r.entryId,
            type: 'adhoc',
            notifyMethods: r.notifyMethods,
            message: undefined,
            tz: r.tz,
            status: r.status,
            fireAt: r.fireAt,
        });
        expect(out).not.toHaveProperty('schedule');
        expect(out).not.toHaveProperty('dateCreated');
    });

    it('keeps the schedule for a recurring reminder', () => {
        const out = toNewReminder(recurringReminder({message: 'Stretch'}));
        expect(out.schedule).toEqual({kind: 'calendar', at: '09:00'});
        expect(out.message).toBe('Stretch');
        expect(out).not.toHaveProperty('fireAt');
    });
});

describe('useReminderMutations', () => {
    it('creates without an id, updates with one, and invalidates every reminder list', async () => {
        const calls: string[] = [];
        server.use(
            http.post('/api/reminder', () => {
                calls.push('create');
                return HttpResponse.json(adhocReminder());
            }),
            http.put('/api/reminder', () => {
                calls.push('update');
                return HttpResponse.json(adhocReminder());
            }),
        );
        const {result, queryClient} = renderHookWithProviders(() => useReminderMutations());
        queryClient.setQueryData(QK.reminders('link1'), []);
        queryClient.setQueryData(QK.allReminders(1), page([]));

        act(() => result.current.saveReminder({...toNewReminder(adhocReminder()), reminderId: undefined}));
        await waitFor(() => expect(calls).toEqual(['create']));
        act(() => result.current.saveReminder(toNewReminder(adhocReminder())));
        await waitFor(() => expect(calls).toEqual(['create', 'update']));

        expect(queryClient.getQueryState(QK.reminders('link1'))!.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(QK.allReminders(1))!.isInvalidated).toBe(true);
    });

    it('reports a failed delete', async () => {
        server.use(http.delete('/api/reminder/r1', () => HttpResponse.json({message: 'Gone'}, {status: 404})));
        const {result} = renderHookWithProviders(() => useReminderMutations());

        act(() => result.current.removeReminder('r1'));

        expect(await screen.findByText('Gone')).toBeInTheDocument();
    });
});
