import { App } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReminder, deleteReminder, getRemindersForEntry } from '@/api/reminders';
import { QK } from '@/utils/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';
import type { NewReminder } from '@/types';

export function useReminders(entryId: string) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: QK.reminders(entryId),
    queryFn: () => getRemindersForEntry(entryId),
  });

  const addMutation = useMutation({
    mutationFn: (reminder: Omit<NewReminder, 'entryId' | 'tz' | 'status'>) =>
      createReminder({
        ...reminder,
        entryId,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'active',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.reminders(entryId) }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to create reminder')),
  });

  const removeMutation = useMutation({
    mutationFn: (reminderId: string) => deleteReminder(reminderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.reminders(entryId) }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to delete reminder')),
  });

  return {
    reminders,
    isLoading,
    addReminder: addMutation.mutate,
    removeReminder: removeMutation.mutate,
    isAdding: addMutation.isPending,
  };
}
