import dayjs from 'dayjs';
import type {Schedule, Weekday} from '@/types';

export const WEEKDAYS: { value: Weekday; short: string; label: string }[] = [
    {value: 'monday', short: 'Mon', label: 'Monday'},
    {value: 'tuesday', short: 'Tue', label: 'Tuesday'},
    {value: 'wednesday', short: 'Wed', label: 'Wednesday'},
    {value: 'thursday', short: 'Thu', label: 'Thursday'},
    {value: 'friday', short: 'Fri', label: 'Friday'},
    {value: 'saturday', short: 'Sat', label: 'Saturday'},
    {value: 'sunday', short: 'Sun', label: 'Sunday'},
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ORDINALS = [1, 2, 3, 4, 5];

const WORKWEEK: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export function ordinal(n: number): string {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) return `${n}th`;
    return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

export function formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return dayjs().hour(hour).minute(minute).format('h:mm A');
}

function joinList(items: string[]): string {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const sortedNumbers = (values: number[] = []) => [...values].sort((a, b) => a - b);

export function describeSchedule(schedule: Schedule): string {
    if (schedule.kind === 'interval') {
        const unit = schedule.unit === 'minutes' ? 'minute' : 'hour';
        const every = schedule.every === 1 ? `Every ${unit}` : `Every ${schedule.every} ${unit}s`;
        return schedule.from && schedule.to
            ? `${every} between ${formatTime(schedule.from)} and ${formatTime(schedule.to)}`
            : every;
    }

    const weekdays = WEEKDAYS.filter((d) => schedule.weekdays?.includes(d.value));
    const months = sortedNumbers(schedule.months).map((m) => MONTHS[m - 1]);
    const at = `at ${formatTime(schedule.at)}`;

    if (schedule.monthDays?.length || schedule.ordinals?.length) {
        const days = schedule.monthDays?.length
            ? `The ${joinList(sortedNumbers(schedule.monthDays).map(ordinal))}`
            : `The ${joinList(sortedNumbers(schedule.ordinals).map(ordinal))} ${joinList(weekdays.map((d) => d.label))}`;
        const of = months.length ? `of ${joinList(months)}` : 'of every month';
        return `${days} ${of} ${at}`;
    }

    let days: string;
    if (weekdays.length === 0 || weekdays.length === 7) days = 'Every day';
    else if (weekdays.length === 5 && WORKWEEK.every((d) => schedule.weekdays?.includes(d))) days = 'Every weekday';
    else days = `Every ${joinList(weekdays.map((d) => d.label))}`;
    return months.length ? `${days} in ${joinList(months)} ${at}` : `${days} ${at}`;
}
