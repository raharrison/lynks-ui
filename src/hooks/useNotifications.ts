import { App } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllRead, markRead, markUnread } from '@/api/notifications';
import { QK } from '@/utils/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';
import { NOTIFICATIONS_PAGE_SIZE } from '@/utils/constants';
import type { Notification, Page } from '@/types';

export function useNotifications(page: number) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: QK.notifications(page),
    queryFn: () => getNotifications({ page, size: NOTIFICATIONS_PAGE_SIZE }),
  });

  const markReadMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => (read ? markRead(id) : markUnread(id)),
    onSuccess: (_, { id, read }) => {
      // Optimistically update only the current page so position is preserved
      queryClient.setQueryData(QK.notifications(page), (old: Page<Notification> | undefined) => {
        if (!old) return old;
        return { ...old, content: old.content.map((n) => n.id === id ? { ...n, read } : n) };
      });
      queryClient.invalidateQueries({ queryKey: QK.unread() });
    },
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to update notification')),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.notifications() }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to mark all as read')),
  });

  return {
    notifications: data?.content || [],
    total: data?.total || 0,
    isLoading,
    isError,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    markAllReadAsync: markAllReadMutation.mutateAsync,
    isMarking: markReadMutation.isPending,
    isMarkingAll: markAllReadMutation.isPending,
  };
}
