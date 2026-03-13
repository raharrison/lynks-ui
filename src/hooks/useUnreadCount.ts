import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '@/api/notifications';
import { QK } from '@/utils/queryKeys';
import { NOTIFICATION_POLL_INTERVAL } from '@/utils/constants';

export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: QK.unread(),
    queryFn: getUnreadCount,
    refetchInterval: NOTIFICATION_POLL_INTERVAL,
    select: (d) => d.unread,
  });

  return { unread: data ?? 0 };
}
