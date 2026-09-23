import {App, DatePicker, Form, Input, Modal, Radio, Select} from 'antd';
import dayjs from 'dayjs';
import {useQuery} from '@tanstack/react-query';
import {getCurrentUser} from '@/api/user';
import {QK} from '@/utils/queryKeys';
import {NOTIFICATION_METHOD_OPTIONS} from '@/utils/constants';
import {useReminderMutations} from '@/hooks/useReminders';
import ScheduleBuilder from '@/components/reminders/ScheduleBuilder';
import type {NotificationMethod, Reminder, ReminderType, Schedule} from '@/types';

interface FormValues {
    type: ReminderType;
    date?: dayjs.Dayjs;
    schedule?: Schedule;
    message?: string;
    notifyMethods?: NotificationMethod[];
}

function initialValues(reminder?: Reminder): FormValues {
    if (!reminder) return {type: 'adhoc', notifyMethods: ['push']};
    return {
        type: reminder.type,
        date: reminder.type === 'adhoc' ? dayjs(reminder.fireAt) : undefined,
        schedule: reminder.type === 'recurring' ? reminder.schedule : undefined,
        message: reminder.message ?? undefined,
        notifyMethods: reminder.notifyMethods,
    };
}

/** Creates a reminder on `entryId`, or edits `reminder` when one is given. */
export default function ReminderFormModal({open, onClose, entryId, reminder}: {
    open: boolean;
    onClose: () => void;
    entryId: string;
    reminder?: Reminder;
}) {
    const {message} = App.useApp();
    const [form] = Form.useForm<FormValues>();
    const {saveReminder, isSaving} = useReminderMutations();
    const {data: user} = useQuery({queryKey: QK.user(), queryFn: getCurrentUser});
    const methodOptions = NOTIFICATION_METHOD_OPTIONS.map((option) =>
        option.value === 'jolt' ? {...option, disabled: !user?.joltConfigured} : option);

    const handleSubmit = (values: FormValues) => {
        saveReminder({
            reminderId: reminder?.reminderId,
            entryId,
            type: values.type,
            ...(values.type === 'adhoc' ? {fireAt: values.date?.valueOf()} : {schedule: values.schedule}),
            message: values.message,
            notifyMethods: values.notifyMethods?.length ? values.notifyMethods : ['push'],
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // saving a completed reminder with a new time brings it back; a paused one stays paused
            status: reminder?.status === 'disabled' ? 'disabled' : 'active',
        }, {
            onSuccess: () => {
                onClose();
                message.success(reminder ? 'Reminder updated' : 'Reminder created');
            },
        });
    };

    return (
        <Modal
            title={reminder ? 'Edit Reminder' : 'New Reminder'}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={reminder ? 'Save' : 'Create'}
            confirmLoading={isSaving}
            destroyOnHidden
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={initialValues(reminder)}>
                <Form.Item name="type" label="Type">
                    <Radio.Group>
                        <Radio value="adhoc">One-time</Radio>
                        <Radio value="recurring">Recurring</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                    {({getFieldValue}) =>
                        getFieldValue('type') === 'adhoc' ? (
                            <Form.Item name="date" label="Date & Time" rules={[
                                {required: true, message: 'Choose when to be reminded'},
                                {validator: (_, v?: dayjs.Dayjs) => !v || v.isAfter(dayjs()) ? Promise.resolve() : Promise.reject(new Error('Choose a time in the future'))},
                            ]}>
                                <DatePicker showTime disabledDate={(d) => d.isBefore(dayjs(), 'day')} style={{width: '100%'}}/>
                            </Form.Item>
                        ) : (
                            <Form.Item name="schedule" label="Repeats"
                                       rules={[{required: true, message: 'Finish choosing the schedule'}]}>
                                <ScheduleBuilder/>
                            </Form.Item>
                        )
                    }
                </Form.Item>

                <Form.Item name="message" label="Message">
                    <Input placeholder="Optional reminder message"/>
                </Form.Item>

                <Form.Item name="notifyMethods" label="Notification Methods"
                           extra={user?.joltConfigured ? undefined : 'Set your Jolt token under Settings to use Jolt'}>
                    <Select mode="multiple" options={methodOptions}/>
                </Form.Item>
            </Form>
        </Modal>
    );
}
