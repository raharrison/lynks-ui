import {useState} from 'react';
import {Button, Empty, Spin, Typography} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {useReminders} from '@/hooks/useReminders';
import ReminderList from '@/components/reminders/ReminderList';
import ReminderFormModal from '@/components/reminders/ReminderFormModal';

export default function ReminderSection({ entryId }: { entryId: string }) {
    const {reminders, isLoading} = useReminders(entryId);
    const [creating, setCreating] = useState(false);

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Text strong style={{ fontSize: 'var(--font-size-md)' }}>
          Reminders ({reminders.length})
        </Typography.Text>
          <Button icon={<PlusOutlined/>} onClick={() => setCreating(true)} style={{borderRadius: 'var(--radius-pill)'}}>
          Add
        </Button>
      </div>

        {reminders.length === 0
            ? <Empty description="No reminders" style={{padding: '24px 0'}}/>
            : <ReminderList reminders={reminders}/>}

        <ReminderFormModal open={creating} onClose={() => setCreating(false)} entryId={entryId}/>
    </div>
  );
}
