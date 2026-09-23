import {useEffect, useState} from 'react';
import {Empty, Pagination, Result, Spin, Typography} from 'antd';
import {ClockCircleOutlined} from '@ant-design/icons';
import {useAllReminders} from '@/hooks/useReminders';
import {REMINDERS_PAGE_SIZE} from '@/utils/constants';
import ReminderList from '@/components/reminders/ReminderList';

export default function RemindersPage() {
    useEffect(() => {
        document.title = 'Reminders - Lynks';
    }, []);
    const [page, setPage] = useState(1);
    const {reminders, total, isLoading, isError} = useAllReminders(page);

    return (
        <div>
            <Typography.Title level={3} style={{margin: '0 0 24px'}}>
                <ClockCircleOutlined style={{marginRight: 10}}/>
                Reminders
            </Typography.Title>

            {isLoading ? (
                <div style={{textAlign: 'center', padding: 48}}><Spin size="large"/></div>
            ) : isError ? (
                <Result status="error" title="Failed to load reminders"/>
            ) : reminders.length === 0 ? (
                <div className="empty-state">
                    <Empty description="No reminders yet. Add one from an entry's Reminders tab"/>
                </div>
            ) : (
                <ReminderList reminders={reminders} showEntry/>
            )}

            {total > REMINDERS_PAGE_SIZE && (
                <div style={{textAlign: 'center', marginTop: 24}}>
                    <Pagination current={page} total={total} pageSize={REMINDERS_PAGE_SIZE} onChange={setPage}
                                showTotal={(t) => `${t} reminders`}/>
                </div>
            )}
        </div>
    );
}
