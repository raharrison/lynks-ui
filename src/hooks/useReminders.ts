import {App} from 'antd';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createReminder, deleteReminder, getReminders, getRemindersForEntry, updateReminder} from '@/api/reminders';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';
import {REMINDERS_PAGE_SIZE} from '@/utils/constants';
import type {NewReminder, Reminder} from '@/types';

export function toNewReminder(reminder: Reminder): NewReminder {
  return {
    reminderId: reminder.reminderId,
    entryId: reminder.entryId,
    type: reminder.type,
    notifyMethods: reminder.notifyMethods,
    message: reminder.message ?? undefined,
    tz: reminder.tz,
    status: reminder.status,
    ...(reminder.type === 'adhoc' ? {fireAt: reminder.fireAt} : {schedule: reminder.schedule}),
  };
}

export function useReminders(entryId: string) {
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: QK.reminders(entryId),
    queryFn: () => getRemindersForEntry(entryId),
  });
  return {reminders, isLoading};
}

export function useAllReminders(page: number) {
  const {data, isLoading, isError} = useQuery({
    queryKey: QK.allReminders(page),
    queryFn: () => getReminders(page, REMINDERS_PAGE_SIZE),
  });
  return {reminders: data?.content ?? [], total: data?.total ?? 0, isLoading, isError};
}

export function useReminderMutations() {
  const {message} = App.useApp();
  const queryClient = useQueryClient();
  // one entry's list and the all-reminders pages share the prefix
  const invalidate = () => queryClient.invalidateQueries({queryKey: QK.allReminders()});

  const save = useMutation({
    mutationFn: (reminder: NewReminder) => reminder.reminderId ? updateReminder(reminder) : createReminder(reminder),
    onSuccess: invalidate,
      onError: (err) => {
          message.error(getApiErrorMessage(err, 'Failed to save reminder'));
      },
  });

  const remove = useMutation({
    mutationFn: deleteReminder,
    onSuccess: invalidate,
      onError: (err) => {
          message.error(getApiErrorMessage(err, 'Failed to delete reminder'));
      },
  });

  return {
    saveReminder: save.mutate,
    isSaving: save.isPending,
    removeReminder: remove.mutate,
  };
}
