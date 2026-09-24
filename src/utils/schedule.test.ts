import {describe, expect, it} from 'vitest';
import {describeSchedule, formatTime, ordinal} from './schedule';

describe('ordinal', () => {
    it.each([
        [1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'], [10, '10th'],
        [11, '11th'], [12, '12th'], [13, '13th'],
        [21, '21st'], [22, '22nd'], [23, '23rd'], [31, '31st'], [111, '111th'],
    ])('%i -> %s', (n, expected) => {
        expect(ordinal(n)).toBe(expected);
    });
});

describe('formatTime', () => {
    it.each([
        ['00:00', '12:00 AM'],
        ['09:05', '9:05 AM'],
        ['12:30', '12:30 PM'],
        ['23:59', '11:59 PM'],
    ])('%s -> %s', (time, expected) => {
        expect(formatTime(time)).toBe(expected);
    });
});

describe('describeSchedule', () => {
    describe('interval', () => {
        it('uses the singular for an interval of one', () => {
            expect(describeSchedule({kind: 'interval', every: 1, unit: 'hours'})).toBe('Every hour');
            expect(describeSchedule({kind: 'interval', every: 1, unit: 'minutes'})).toBe('Every minute');
        });

        it('pluralises longer intervals', () => {
            expect(describeSchedule({kind: 'interval', every: 30, unit: 'minutes'})).toBe('Every 30 minutes');
        });

        it('includes the window only when both ends are set', () => {
            expect(describeSchedule({kind: 'interval', every: 2, unit: 'hours', from: '09:00', to: '17:00'}))
                .toBe('Every 2 hours between 9:00 AM and 5:00 PM');
            expect(describeSchedule({kind: 'interval', every: 2, unit: 'hours', from: '09:00', to: null}))
                .toBe('Every 2 hours');
        });
    });

    describe('calendar', () => {
        it('treats no weekdays and all seven as every day', () => {
            expect(describeSchedule({kind: 'calendar', at: '08:00'})).toBe('Every day at 8:00 AM');
            expect(describeSchedule({
                kind: 'calendar',
                at: '08:00',
                weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            })).toBe('Every day at 8:00 AM');
        });

        it('names Monday to Friday as weekdays', () => {
            expect(describeSchedule({
                kind: 'calendar',
                at: '08:00',
                weekdays: ['friday', 'monday', 'wednesday', 'tuesday', 'thursday'],
            })).toBe('Every weekday at 8:00 AM');
        });

        it('lists days in week order regardless of input order', () => {
            expect(describeSchedule({kind: 'calendar', at: '18:30', weekdays: ['friday', 'monday', 'wednesday']}))
                .toBe('Every Monday, Wednesday and Friday at 6:30 PM');
        });

        it('does not call five days that include a weekend a weekday', () => {
            expect(describeSchedule({
                kind: 'calendar',
                at: '08:00',
                weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'saturday'],
            })).toBe('Every Monday, Tuesday, Wednesday, Thursday and Saturday at 8:00 AM');
        });

        it('narrows by month', () => {
            expect(describeSchedule({kind: 'calendar', at: '08:00', months: [12, 1]}))
                .toBe('Every day in Jan and Dec at 8:00 AM');
        });

        it('describes days of the month in numeric order', () => {
            expect(describeSchedule({kind: 'calendar', at: '09:00', monthDays: [15, 1]}))
                .toBe('The 1st and 15th of every month at 9:00 AM');
        });

        it('describes ordinal weekdays', () => {
            expect(describeSchedule({kind: 'calendar', at: '09:00', ordinals: [3, 1], weekdays: ['tuesday']}))
                .toBe('The 1st and 3rd Tuesday of every month at 9:00 AM');
        });

        it('limits monthly schedules to chosen months', () => {
            expect(describeSchedule({kind: 'calendar', at: '09:00', monthDays: [1], months: [4, 1, 7, 10]}))
                .toBe('The 1st of Jan, Apr, Jul and Oct at 9:00 AM');
        });

        it('prefers month days over ordinals when both are present', () => {
            expect(describeSchedule({kind: 'calendar', at: '09:00', monthDays: [5], ordinals: [2], weekdays: ['monday']}))
                .toBe('The 5th of every month at 9:00 AM');
        });
    });
});
