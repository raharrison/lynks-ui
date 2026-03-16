import {useEffect, useState} from 'react';
import {App, Badge, Button, Empty, Pagination, Result, Spin, Tag, Typography} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  MessageOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {formatRelative} from '@/utils/format';
import {useNotifications} from '@/hooks/useNotifications';
import {NOTIFICATIONS_PAGE_SIZE} from '@/utils/constants';
import type {Notification, NotificationType} from '@/types';

const typeConfig: Record<NotificationType, { color: string; icon: React.ReactNode }> = {
  processed: { color: 'green', icon: <CheckCircleOutlined /> },
  error: { color: 'red', icon: <WarningOutlined /> },
  reminder: { color: 'blue', icon: <ClockCircleOutlined /> },
  discussions: { color: 'purple', icon: <MessageOutlined /> },
};

export default function NotificationsPage() {
    useEffect(() => {
        document.title = 'Notifications - Lynks';
    }, []);
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { notifications, total, isLoading, isError, markRead, markAllReadAsync, isMarkingAll } = useNotifications(page);

  const handleMarkAllRead = async () => {
    try {
      const { read } = await markAllReadAsync();
      message.success(`Marked ${read} notifications as read`);
    } catch {
      message.error('Failed to mark notifications as read');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 10 }} />
          Notifications
        </Typography.Title>
        <Button
          icon={<CheckOutlined />}
          onClick={handleMarkAllRead}
          loading={isMarkingAll}
          style={{ borderRadius: 'var(--radius-pill)' }}
        >
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
      ) : isError ? (
        <Result status="error" title="Failed to load notifications" />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Empty description="No notifications" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((notification: Notification) => {
            const config = typeConfig[notification.type];
            return (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? '' : 'unread'}`}
                style={{ cursor: notification.entryId ? 'pointer' : undefined }}
                onClick={() => {
                  if (notification.entryId) {
                    if (!notification.read) markRead({ id: notification.id, read: true });
                    navigate(`/entry/${notification.entryId}`);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <Badge dot={!notification.read} offset={[-2, 2]}>
                    <span style={{ fontSize: 20, color: config.color }}>{config.icon}</span>
                  </Badge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Typography.Text strong={!notification.read} style={{ fontSize: 14 }}>
                        {notification.message}
                      </Typography.Text>
                      <Tag color={config.color} style={{ fontSize: 'var(--font-size-xxs)', margin: 0 }}>{notification.type}</Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {formatRelative(notification.dateCreated)}
                      </Typography.Text>
                      {notification.entryTitle && (
                        <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                          <ExportOutlined /> {notification.entryTitle}
                        </Typography.Text>
                      )}
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead({ id: notification.id, read: !notification.read });
                    }}
                  >
                    {notification.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > NOTIFICATIONS_PAGE_SIZE && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination current={page} total={total} pageSize={NOTIFICATIONS_PAGE_SIZE} onChange={setPage} showTotal={(t) => `${t} notifications`} showQuickJumper />
        </div>
      )}
    </div>
  );
}
