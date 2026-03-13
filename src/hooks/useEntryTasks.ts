import { App } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { runTask } from '@/api/tasks';
import { getApiErrorMessage } from '@/utils/apiError';

export function useEntryTasks(entryId: string) {
  const { message } = App.useApp();
  const { mutate, isPending, variables } = useMutation({
    mutationFn: ({ taskId, params }: { taskId: string; params: Record<string, string> }) =>
      runTask(entryId, taskId, params),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to run task')),
  });

  return {
    runTask: mutate,
    isRunning: isPending,
    runningTaskId: isPending ? variables?.taskId ?? null : null,
  };
}
