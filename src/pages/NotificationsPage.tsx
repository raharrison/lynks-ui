import {useEffect, useState} from 'react';
import {App, Badge, Button, Empty, Pagination, Result, Spin, Tag, Tooltip, Typography} from 'antd';
import {
    CheckCircleOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    ExportOutlined,
    MessageOutlined,
    ReadOutlined,
    UndoOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {formatRelative} from '@/utils/format';
import {useNotifications} from '@/hooks/useNotifications';
import {NOTIFICATIONS_PAGE_SIZE} from '@/utils/constants';
import PageHeader from '@/components/common/PageHeader';
import type {Notification, NotificationType} from '@/types';

/* The chip stays neutral; the icon colour is what distinguishes the kind. */
const typeConfig: Record<NotificationType, { iconColor: string; icon: React.ReactNode }> = {
    processed: {iconColor: 'var(--chip-note)', icon: <CheckCircleOutlined/>},
    error: {iconColor: 'var(--color-danger)', icon: <WarningOutlined/>},
    reminder: {iconColor: 'var(--chip-link)', icon: <ClockCircleOutlined/>},
    discussions: {iconColor: 'var(--chip-file)', icon: <MessageOutlined/>},
    digest: {iconColor: 'var(--chip-snippet)', icon: <ReadOutlined/>},
};

export default function NotificationsPage() {
    useEffect(() => {
        document.title = 'Notifications - Lynks';
    }, []);
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

    const {notifications, total, isLoading, isError, markRead, markAllRead, isMarkingAll} = useNotifications(page);

    const handleMarkAllRead = () =>
        markAllRead(undefined, {onSuccess: ({read}) => message.success(`Marked ${read} notifications as read`)});

  return (
    <div>
      <PageHeader
          title="Notifications"
          meta={total > 0 ? `(${total})` : null}
          actions={notifications.length > 0 && (
              <Button
                  icon={<CheckOutlined />}
                  onClick={handleMarkAllRead}
                  loading={isMarkingAll}
                  style={{ borderRadius: 'var(--radius-pill)' }}
              >
                Mark all read
              </Button>
          )}
      />

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
                      <span style={{fontSize: 20, color: config.iconColor}}>{config.icon}</span>
                  </Badge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Paragraph strong={!notification.read}
                                          style={{ fontSize: 14, margin: '0 0 4px', overflowWrap: 'anywhere' }}>
                      {notification.message}
                    </Typography.Paragraph>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Tag className="lynks-chip"
                           style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>{notification.type}</Tag>
                      <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {formatRelative(notification.dateCreated)}
                      </Typography.Text>
                      {notification.entryTitle && (
                        <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)', minWidth: 0 }} ellipsis>
                          <ExportOutlined /> {notification.entryTitle}
                        </Typography.Text>
                      )}
                    </div>
                  </div>
                  <Tooltip title={notification.read ? 'Mark unread' : 'Mark read'}>
                    <Button
                      type="text"
                      size="small"
                      icon={notification.read ? <UndoOutlined /> : <CheckOutlined />}
                      aria-label={notification.read ? 'Mark unread' : 'Mark read'}
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead({ id: notification.id, read: !notification.read });
                      }}
                    />
                  </Tooltip>
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
