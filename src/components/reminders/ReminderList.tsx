import {useState} from 'react';
import {App, Button, Popconfirm, Tag, Tooltip, Typography} from 'antd';
import {
    BellOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    ExportOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
} from '@ant-design/icons';
import {Link} from 'react-router-dom';
import {entryDetailPath, formatDateTime} from '@/utils/format';
import {describeSchedule} from '@/utils/schedule';
import {toNewReminder, useReminderMutations} from '@/hooks/useReminders';
import ReminderFormModal from '@/components/reminders/ReminderFormModal';
import type {Reminder, ReminderStatus} from '@/types';

const statusChip: Record<ReminderStatus, { className: string; label: string }> = {
    active: {className: 'lynks-chip lynks-chip-accent', label: 'active'},
    disabled: {className: 'lynks-chip', label: 'paused'},
    completed: {className: 'lynks-chip', label: 'completed'},
};

function ReminderItem({reminder, showEntry, onEdit}: { reminder: Reminder; showEntry: boolean; onEdit: () => void }) {
    const {message} = App.useApp();
    const {saveReminder, removeReminder} = useReminderMutations();
    const chip = statusChip[reminder.status];
    const [mountedAt] = useState(Date.now);
    // resuming would fire it at once, since the worker runs any past time immediately
    const expired = reminder.type === 'adhoc' && reminder.fireAt <= mountedAt;

    const setPaused = (paused: boolean) => saveReminder(
        {...toNewReminder(reminder), status: paused ? 'disabled' : 'active'},
        {onSuccess: () => message.success(paused ? 'Reminder paused' : 'Reminder resumed')},
    );

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid var(--border-secondary)',
            background: 'var(--bg-surface)',
            opacity: reminder.status === 'active' ? 1 : 0.75,
        }}>
            <ClockCircleOutlined style={{fontSize: 18, color: 'var(--text-muted)', flexShrink: 0}}/>
            <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap'}}>
                    <Typography.Text style={{fontSize: 14}}>
                        {reminder.message || (reminder.type === 'adhoc' ? 'One-time reminder' : 'Recurring reminder')}
                    </Typography.Text>
                    <Tag className={chip.className} style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>{chip.label}</Tag>
                </div>
                <div style={{display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap'}}>
                    <Typography.Text type="secondary" style={{fontSize: 'var(--font-size-xs)'}}>
                        {reminder.type === 'adhoc'
                            ? formatDateTime(new Date(reminder.fireAt).toISOString())
                            : describeSchedule(reminder.schedule)}
                    </Typography.Text>
                    {reminder.notifyMethods.map((m) => (
                        <Tag key={m} icon={<BellOutlined/>} className="lynks-chip"
                             style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>{m}</Tag>
                    ))}
                    {showEntry && (
                        <Link
                            to={reminder.entryType ? entryDetailPath(reminder.entryType, reminder.entryId) : `/entry/${reminder.entryId}`}
                            style={{fontSize: 'var(--font-size-xs)'}}>
                            <ExportOutlined/> {reminder.entryTitle || 'Open entry'}
                        </Link>
                    )}
                </div>
            </div>
            <div style={{display: 'flex', gap: 2, flexShrink: 0}}>
                {reminder.status === 'active' && (
                    <Tooltip title="Pause">
                        <Button type="text" size="small" icon={<PauseCircleOutlined/>} aria-label="Pause"
                                onClick={() => setPaused(true)}/>
                    </Tooltip>
                )}
                {reminder.status === 'disabled' && (
                    <Tooltip title={expired ? 'This time has passed. Edit it to choose a new one' : 'Resume'}>
                        <Button type="text" size="small" icon={<PlayCircleOutlined/>} aria-label="Resume"
                                disabled={expired} onClick={() => setPaused(false)}/>
                    </Tooltip>
                )}
                <Tooltip title="Edit">
                    <Button type="text" size="small" icon={<EditOutlined/>} aria-label="Edit" onClick={onEdit}/>
                </Tooltip>
                <Popconfirm
                    title="Delete this reminder?"
                    onConfirm={() => removeReminder(reminder.reminderId, {onSuccess: () => message.success('Reminder deleted')})}
                >
                    <Button type="text" size="small" danger icon={<DeleteOutlined/>} aria-label="Delete"/>
                </Popconfirm>
            </div>
        </div>
    );
}

export default function ReminderList({reminders, showEntry = false}: { reminders: Reminder[]; showEntry?: boolean }) {
    const [editing, setEditing] = useState<Reminder | null>(null);

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {reminders.map((reminder) => (
                    <ReminderItem key={reminder.reminderId} reminder={reminder} showEntry={showEntry}
                                  onEdit={() => setEditing(reminder)}/>
                ))}
            </div>
            {editing && (
                <ReminderFormModal open onClose={() => setEditing(null)} entryId={editing.entryId} reminder={editing}/>
            )}
        </>
    );
}
