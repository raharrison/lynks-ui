import {beforeEach, describe, expect, it, vi} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {renderWithProviders} from '@/test/render';
import type {Schedule} from '@/types';
import ScheduleBuilder from './ScheduleBuilder';

let previewed: unknown[] = [];

beforeEach(() => {
    previewed = [];
    server.use(http.post('/api/reminder/preview', async ({request}) => {
        previewed.push(await request.json());
        return HttpResponse.json(['2026-01-16T09:00:00Z', '2026-01-17T09:00:00Z']);
    }));
});

function setup(value?: Schedule) {
    const onChange = vi.fn();
    renderWithProviders(<ScheduleBuilder value={value} onChange={onChange}/>);
    const last = () => onChange.mock.lastCall?.[0] as Schedule | undefined;
    return {onChange, last};
}

const chip = (name: string) => screen.getByRole('checkbox', {name});

describe('ScheduleBuilder', () => {
    it('starts daily at 9 and previews the next runs from the server', async () => {
        const {last} = setup();

        await waitFor(() => expect(last()).toEqual({kind: 'calendar', at: '09:00'}));
        expect(screen.getByText('Every day at 9:00 AM')).toBeInTheDocument();
        expect(await screen.findByText('Next: Jan 16, 2026 9:00 AM · Jan 17, 2026 9:00 AM')).toBeInTheDocument();
        expect(previewed[0]).toMatchObject({schedule: {kind: 'calendar', at: '09:00'}, tz: expect.any(String)});
    });

    it('builds a weekly schedule from the day chips', async () => {
        const {last} = setup();

        await userEvent.click(screen.getByText('Weekly'));
        expect(chip('Mon')).toHaveAttribute('aria-checked', 'true');
        await userEvent.click(chip('Wed'));
        await userEvent.click(chip('Fri'));

        await waitFor(() => expect(last()).toEqual({kind: 'calendar', at: '09:00', weekdays: ['monday', 'wednesday', 'friday']}));
        expect(screen.getByText('Every Monday, Wednesday and Friday at 9:00 AM')).toBeInTheDocument();
    });

    it('emits undefined and explains why when no day is chosen', async () => {
        const {last} = setup();

        await userEvent.click(screen.getByText('Weekly'));
        await userEvent.click(chip('Mon'));

        expect(screen.getByText('Choose at least one day')).toBeInTheDocument();
        await waitFor(() => expect(last()).toBeUndefined());
    });

    it('toggles chips from the keyboard', async () => {
        const {last} = setup();
        await userEvent.click(screen.getByText('Weekly'));

        chip('Tue').focus();
        await userEvent.keyboard(' ');

        await waitFor(() => expect(last()).toMatchObject({weekdays: ['monday', 'tuesday']}));
    });

    it('switching to an interval uses that unit\'s default', async () => {
        const {last} = setup();

        await userEvent.click(screen.getByText('Minutes'));
        await waitFor(() => expect(last()).toEqual({kind: 'interval', every: 30, unit: 'minutes'}));

        await userEvent.click(screen.getByText('Hours'));
        await waitFor(() => expect(last()).toEqual({kind: 'interval', every: 1, unit: 'hours'}));
        expect(screen.getByText('Every hour')).toBeInTheDocument();
    });

    it('rejects a missing interval', async () => {
        const {last} = setup({kind: 'interval', every: 2, unit: 'hours'});

        await userEvent.clear(screen.getByRole('spinbutton'));

        await waitFor(() => expect(last()).toBeUndefined());
        expect(screen.getByText('Choose between 1 and 24 hours')).toBeInTheDocument();
    });

    it('adds the window when limited to certain hours', async () => {
        const {last} = setup({kind: 'interval', every: 15, unit: 'minutes'});

        await userEvent.click(screen.getByRole('checkbox', {name: 'Only between'}));

        await waitFor(() => expect(last()).toEqual({kind: 'interval', every: 15, unit: 'minutes', from: '09:00', to: '17:00'}));
        expect(screen.getByText('Every 15 minutes between 9:00 AM and 5:00 PM')).toBeInTheDocument();
    });

    it('builds a monthly schedule on ordinal weekdays in chosen months', async () => {
        const {last} = setup();

        await userEvent.click(screen.getByText('Monthly'));
        await userEvent.click(screen.getByLabelText('On weekdays of the month'));
        await userEvent.click(chip('3rd'));
        await userEvent.click(chip('Dec'));

        await waitFor(() => expect(last()).toEqual({
            kind: 'calendar', at: '09:00', weekdays: ['monday'], ordinals: [1, 3], months: [12],
        }));
        expect(screen.getByText('The 1st and 3rd Monday of Dec at 9:00 AM')).toBeInTheDocument();
    });

    it('seeds the controls from an existing schedule', () => {
        setup({kind: 'calendar', at: '14:30', ordinals: [2], weekdays: ['thursday']});

        // antd ids every radio group 'test-id' under test, so jsdom unchecks the input; its wrapper still shows the state
        expect(screen.getByText('On weekdays of the month').closest('label')).toHaveClass('ant-radio-wrapper-checked');
        expect(chip('2nd')).toHaveAttribute('aria-checked', 'true');
        expect(chip('Thu')).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByText('The 2nd Thursday of every month at 2:30 PM')).toBeInTheDocument();
    });

    it('emits once per change, not on every render', async () => {
        const {onChange} = setup({kind: 'calendar', at: '09:00', weekdays: ['monday']});
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

        await userEvent.click(chip('Tue'));
        await userEvent.click(chip('Tue'));

        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(3));
        expect(onChange.mock.calls.map(([s]) => s.weekdays)).toEqual([['monday'], ['monday', 'tuesday'], ['monday']]);
    });

    it('shows the server\'s objection when the preview fails', async () => {
        server.use(http.post('/api/reminder/preview', () => HttpResponse.json({message: 'Never fires'}, {status: 400})));
        setup({kind: 'calendar', at: '09:00', monthDays: [31], months: [2]});

        expect(await screen.findByText('Never fires')).toBeInTheDocument();
    });
});
