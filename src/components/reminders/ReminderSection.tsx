import {useState} from 'react';
import {App, Button, DatePicker, Empty, Form, Input, Modal, Popconfirm, Radio, Select, Spin, Tag, Typography} from 'antd';
import {BellOutlined, ClockCircleOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import {formatDateTime} from '@/utils/format';
import {useReminders} from '@/hooks/useReminders';
import {getApiErrorMessage} from '@/utils/apiError';
import {NOTIFICATION_METHOD_OPTIONS} from '@/utils/constants';
import type {NotificationMethod, Reminder, ReminderType} from '@/types';

const statusColors: Record<string, string> = {
  active: 'green',
  completed: 'default',
  disabled: 'red',
};

export default function ReminderSection({ entryId }: { entryId: string }) {
  const { message } = App.useApp();
  const { reminders, isLoading, addReminder, removeReminder, isAdding } = useReminders(entryId);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = (values: { type: ReminderType; spec?: string; date?: dayjs.Dayjs; message?: string; notifyMethods: NotificationMethod[] }) => {
    let spec: string;
    if (values.type === 'adhoc' && values.date) {
      spec = String(values.date.valueOf());
    } else {
      spec = String(values.spec);
    }
    addReminder(
      { type: values.type, spec, message: values.message, notifyMethods: values.notifyMethods || ['web'] },
      {
        onSuccess: () => { setModalOpen(false); form.resetFields(); message.success('Reminder created'); },
        onError: (err: Error) => message.error(getApiErrorMessage(err, 'Failed to create reminder')),
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Text strong style={{ fontSize: 'var(--font-size-md)' }}>
          Reminders ({reminders.length})
        </Typography.Text>
        <Button icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 'var(--radius-pill)' }}>
          Add
        </Button>
      </div>

      {reminders.length === 0 ? (
        <Empty description="No reminders" style={{ padding: '24px 0' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reminders.map((reminder: Reminder) => (
            <div key={reminder.reminderId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 10,
              border: '1px solid var(--border-secondary)',
              background: 'var(--bg-surface)',
            }}>
              <ClockCircleOutlined style={{ fontSize: 18, color: 'var(--text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {reminder.message || (reminder.type === 'adhoc' ? 'One-time reminder' : 'Recurring reminder')}
                  </Typography.Text>
                  <Tag color={statusColors[reminder.status]} style={{ fontSize: 'var(--font-size-xxs)', margin: 0 }}>{reminder.status}</Tag>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Tag style={{ margin: 0 }}>{reminder.type}</Tag>
                  {reminder.type === 'adhoc' && (
                    <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {formatDateTime(new Date(Number(reminder.spec)).toISOString())}
                    </Typography.Text>
                  )}
                  {reminder.type === 'recurring' && (
                    <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>{reminder.spec}</Typography.Text>
                  )}
                  {reminder.notifyMethods.map((m) => (
                    <Tag key={m} icon={<BellOutlined />} style={{ fontSize: 'var(--font-size-xxs)', margin: 0 }}>{m}</Tag>
                  ))}
                </div>
              </div>
              <Popconfirm
                title="Delete this reminder?"
                onConfirm={() => removeReminder(reminder.reminderId, {
                  onSuccess: () => message.success('Reminder deleted'),
                })}
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          ))}
        </div>
      )}

      <Modal
        title="New Reminder"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isAdding}
        destroyOnHidden
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ type: 'adhoc', notifyMethods: ['web'] }}>
          <Form.Item name="type" label="Type">
            <Radio.Group>
              <Radio value="adhoc">One-time</Radio>
              <Radio value="recurring">Recurring</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'adhoc' ? (
                <Form.Item name="date" label="Date & Time" rules={[{ required: true }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              ) : (
                <Form.Item name="spec" label="Schedule (cron expression)" rules={[{ required: true }]}>
                  <Input placeholder="e.g. every monday at 9am" />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item name="message" label="Message">
            <Input placeholder="Optional reminder message" />
          </Form.Item>

          <Form.Item name="notifyMethods" label="Notification Methods">
            <Select mode="multiple" options={NOTIFICATION_METHOD_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
