import {useEffect, useMemo, useState} from 'react';
import {Checkbox, InputNumber, Radio, Segmented, Select, Spin, Tag, TimePicker, Typography} from 'antd';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {previewSchedule} from '@/api/reminders';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';
import {formatDateTime} from '@/utils/format';
import {describeSchedule, MONTHS, ordinal, ORDINALS, WEEKDAYS} from '@/utils/schedule';
import type {Schedule, Weekday} from '@/types';

type Mode = 'minutes' | 'hours' | 'daily' | 'weekly' | 'monthly';

interface Draft {
    mode: Mode;
    every: number;
    windowed: boolean;
    from: string;
    to: string;
    at: string;
    weekdays: Weekday[];
    monthlyBy: 'day' | 'weekday';
    monthDays: number[];
    ordinals: number[];
    months: number[];
}

const INITIAL_DRAFT: Draft = {
    mode: 'daily',
    every: 1,
    windowed: false,
    from: '09:00',
    to: '17:00',
    at: '09:00',
    weekdays: ['monday'],
    monthlyBy: 'day',
    monthDays: [1],
    ordinals: [1],
    months: [],
};

const MODE_OPTIONS = [
    {label: 'Minutes', value: 'minutes'},
    {label: 'Hours', value: 'hours'},
    {label: 'Daily', value: 'daily'},
    {label: 'Weekly', value: 'weekly'},
    {label: 'Monthly', value: 'monthly'},
];

const EVERY_LIMITS = {minutes: 1440, hours: 24};
const DEFAULT_EVERY = {minutes: 30, hours: 1};

const MONTH_DAY_OPTIONS = Array.from({length: 31}, (_, i) => ({value: i + 1, label: ordinal(i + 1)}));

function toDraft(schedule?: Schedule): Draft {
    if (!schedule) return INITIAL_DRAFT;
    if (schedule.kind === 'interval') {
        return {
            ...INITIAL_DRAFT,
            mode: schedule.unit,
            every: schedule.every,
            windowed: !!(schedule.from && schedule.to),
            from: schedule.from ?? INITIAL_DRAFT.from,
            to: schedule.to ?? INITIAL_DRAFT.to,
        };
    }
    const base = {...INITIAL_DRAFT, at: schedule.at, months: schedule.months ?? []};
    if (schedule.monthDays?.length) return {...base, mode: 'monthly', monthlyBy: 'day', monthDays: schedule.monthDays};
    if (schedule.ordinals?.length) {
        return {...base, mode: 'monthly', monthlyBy: 'weekday', ordinals: schedule.ordinals, weekdays: schedule.weekdays ?? []};
    }
    if (schedule.weekdays?.length) return {...base, mode: 'weekly', weekdays: schedule.weekdays};
    return {...base, mode: 'daily'};
}

function toSchedule(d: Draft): { schedule?: Schedule; problem?: string } {
    switch (d.mode) {
        case 'minutes':
        case 'hours':
            if (!d.every || d.every < 1 || d.every > EVERY_LIMITS[d.mode]) {
                return {problem: `Choose between 1 and ${EVERY_LIMITS[d.mode]} ${d.mode}`};
            }
            if (d.windowed && d.from >= d.to) return {problem: 'The window must start before it ends'};
            return {
                schedule: {
                    kind: 'interval', every: d.every, unit: d.mode,
                    ...(d.windowed ? {from: d.from, to: d.to} : {}),
                },
            };
        case 'daily':
            return {schedule: {kind: 'calendar', at: d.at}};
        case 'weekly':
            if (d.weekdays.length === 0) return {problem: 'Choose at least one day'};
            return {schedule: {kind: 'calendar', at: d.at, weekdays: d.weekdays}};
        case 'monthly':
            if (d.monthlyBy === 'day') {
                if (d.monthDays.length === 0) return {problem: 'Choose at least one day of the month'};
                return {schedule: {kind: 'calendar', at: d.at, monthDays: d.monthDays, months: d.months}};
            }
            if (d.ordinals.length === 0 || d.weekdays.length === 0) return {problem: 'Choose which weekdays of the month'};
            return {schedule: {kind: 'calendar', at: d.at, weekdays: d.weekdays, ordinals: d.ordinals, months: d.months}};
    }
}

function ToggleChips<T extends string | number>({options, value, onChange}: {
    options: { value: T; label: string }[];
    value: T[];
    onChange: (value: T[]) => void;
}) {
    const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    return (
        <div role="group" style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            {options.map((o) => {
                const checked = value.includes(o.value);
                return (
                    <Tag
                        key={String(o.value)}
                        role="checkbox"
                        aria-checked={checked}
                        tabIndex={0}
                        className={`lynks-chip lynks-chip-clickable${checked ? ' lynks-chip-accent' : ''}`}
                        style={{margin: 0, userSelect: 'none'}}
                        onClick={() => toggle(o.value)}
                        onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                toggle(o.value);
                            }
                        }}
                    >
                        {o.label}
                    </Tag>
                );
            })}
        </div>
    );
}

function TimeInput({value, onChange}: { value: string; onChange: (value: string) => void }) {
    return (
        <TimePicker
            value={dayjs(`2000-01-01T${value}`)}
            onChange={(t) => t && onChange(t.format('HH:mm'))}
            format="h:mm A"
            use12Hours
            allowClear={false}
            needConfirm={false}
            style={{width: 120}}
        />
    );
}

function Row({label, children}: { label: string; children: React.ReactNode }) {
    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
            <Typography.Text type="secondary" style={{width: 56, flexShrink: 0}}>{label}</Typography.Text>
            <div style={{flex: 1, minWidth: 0}}>{children}</div>
        </div>
    );
}

/**
 * Form control that emits a Schedule, or undefined while the choices are incomplete.
 * `value` only seeds the first render; after that the builder owns its draft.
 */
export default function ScheduleBuilder({value, onChange}: { value?: Schedule; onChange?: (schedule?: Schedule) => void }) {
    const [draft, setDraft] = useState<Draft>(() => toDraft(value));
    const set = (patch: Partial<Draft>) => setDraft((d) => ({...d, ...patch}));

    const {schedule, problem} = useMemo(() => toSchedule(draft), [draft]);
    const spec = schedule ? JSON.stringify(schedule) : '';

    useEffect(() => {
        onChange?.(schedule);
        // keyed on the serialised spec so an equal schedule does not re-emit
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spec]);

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const preview = useQuery({
        queryKey: QK.schedulePreview(spec, tz),
        queryFn: () => previewSchedule(schedule!, tz),
        enabled: !!schedule,
        retry: false,
        staleTime: 60_000,
    });

    const isInterval = draft.mode === 'minutes' || draft.mode === 'hours';

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <Segmented
                block
                options={MODE_OPTIONS}
                value={draft.mode}
                onChange={(mode) => {
                    const m = mode as Mode;
                    set(m === 'minutes' || m === 'hours' ? {mode: m, every: DEFAULT_EVERY[m]} : {mode: m});
                }}
            />

            {isInterval && (
                <>
                    <Row label="Every">
                        <InputNumber
                            min={1}
                            max={EVERY_LIMITS[draft.mode as 'minutes' | 'hours']}
                            value={draft.every}
                            onChange={(v) => set({every: v ?? 0})}
                            suffix={draft.mode}
                            style={{width: 160}}
                        />
                    </Row>
                    <Row label="">
                        <Checkbox checked={draft.windowed} onChange={(e) => set({windowed: e.target.checked})}>
                            Only between
                        </Checkbox>
                        {draft.windowed && (
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                <TimeInput value={draft.from} onChange={(from) => set({from})}/>
                and
                <TimeInput value={draft.to} onChange={(to) => set({to})}/>
              </span>
                        )}
                    </Row>
                </>
            )}

            {draft.mode === 'weekly' && (
                <Row label="On">
                    <ToggleChips
                        options={WEEKDAYS.map((d) => ({value: d.value, label: d.short}))}
                        value={draft.weekdays}
                        onChange={(weekdays) => set({weekdays})}
                    />
                </Row>
            )}

            {draft.mode === 'monthly' && (
                <>
                    <Radio.Group value={draft.monthlyBy} onChange={(e) => set({monthlyBy: e.target.value})}>
                        <Radio value="day">On days of the month</Radio>
                        <Radio value="weekday">On weekdays of the month</Radio>
                    </Radio.Group>
                    {draft.monthlyBy === 'day' ? (
                        <Row label="On the">
                            <Select
                                mode="multiple"
                                options={MONTH_DAY_OPTIONS}
                                value={draft.monthDays}
                                onChange={(monthDays) => set({monthDays})}
                                placeholder="Days"
                                style={{width: '100%'}}
                            />
                        </Row>
                    ) : (
                        <>
                            <Row label="On the">
                                <ToggleChips
                                    options={ORDINALS.map((n) => ({value: n, label: ordinal(n)}))}
                                    value={draft.ordinals}
                                    onChange={(ordinals) => set({ordinals})}
                                />
                            </Row>
                            <Row label="">
                                <ToggleChips
                                    options={WEEKDAYS.map((d) => ({value: d.value, label: d.short}))}
                                    value={draft.weekdays}
                                    onChange={(weekdays) => set({weekdays})}
                                />
                            </Row>
                        </>
                    )}
                    <Row label="In">
                        <ToggleChips
                            options={MONTHS.map((label, i) => ({value: i + 1, label}))}
                            value={draft.months}
                            onChange={(months) => set({months})}
                        />
                        <Typography.Text type="secondary" style={{fontSize: 'var(--font-size-xs)'}}>
                            None selected means every month
                        </Typography.Text>
                    </Row>
                </>
            )}

            {!isInterval && (
                <Row label="At">
                    <TimeInput value={draft.at} onChange={(at) => set({at})}/>
                </Row>
            )}

            <div style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-secondary)',
            }}>
                {problem ? (
                    <Typography.Text type="warning">{problem}</Typography.Text>
                ) : schedule && (
                    <>
                        <Typography.Text strong>{describeSchedule(schedule)}</Typography.Text>
                        <div style={{marginTop: 6, fontSize: 'var(--font-size-xs)'}}>
                            {preview.isLoading ? <Spin size="small"/> : preview.isError ? (
                                <Typography.Text
                                    type="danger">{getApiErrorMessage(preview.error, 'Invalid schedule')}</Typography.Text>
                            ) : (
                                <Typography.Text type="secondary">
                                    Next: {preview.data?.map((d) => formatDateTime(d)).join(' · ')}
                                </Typography.Text>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
