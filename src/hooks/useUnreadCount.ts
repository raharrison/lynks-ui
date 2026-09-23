import {useEffect, useRef} from 'react';
import {App} from 'antd';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';
import {getNotifications, getUnreadCount, markRead} from '@/api/notifications';
import {QK} from '@/utils/queryKeys';
import {NOTIFICATION_POLL_INTERVAL} from '@/utils/constants';

const MAX_TOASTS = 3;

export function useUnreadCount() {
    const {notification} = App.useApp();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: QK.unread(),
    queryFn: getUnreadCount,
    refetchInterval: NOTIFICATION_POLL_INTERVAL,
    select: (d) => d.unread,
  });

    // undefined until the first poll, so unread notifications from before page load do not toast
    const previous = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (data === undefined) return;
        const before = previous.current;
        previous.current = data;
        if (before === undefined || data <= before) return;

        const arrived = data - before;
        queryClient.invalidateQueries({queryKey: QK.notifications()});
        getNotifications({page: 1, size: Math.min(arrived, MAX_TOASTS)}).then(({content}) => {
            content.filter((n) => !n.read).forEach((n) => {
                notification.info({
                    key: n.id,
                    title: n.entryTitle ?? 'Notification',
                    description: n.message,
                    placement: 'bottomRight',
                    style: n.entryId ? {cursor: 'pointer'} : undefined,
                    onClick: () => {
                        if (!n.entryId) return;
                        notification.destroy(n.id);
                        markRead(n.id).then(() => queryClient.invalidateQueries({queryKey: QK.notifications()}));
                        navigate(`/entry/${n.entryId}`);
                    },
                });
            });
            if (arrived > MAX_TOASTS) {
                notification.info({
                    key: 'more-notifications',
                    title: `${arrived - MAX_TOASTS} more notifications`,
                    placement: 'bottomRight',
                    style: {cursor: 'pointer'},
                    onClick: () => {
                        notification.destroy('more-notifications');
                        navigate('/notifications');
                    },
                });
            }
            // a failed fetch only costs the toast; the badge has already updated
        }).catch(() => {
        });
    }, [data, notification, queryClient, navigate]);

  return { unread: data ?? 0 };
}
