import { App } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { starEntry, unstarEntry } from '@/api/entries';
import { QK } from '@/utils/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';
import type { AnyEntry, AnySlimEntry, Page } from '@/types';

export function useStarEntry(entryId: string): { toggleStar: (starred: boolean) => void; isStarring: boolean } {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { mutate: toggleStar, isPending: isStarring } = useMutation({
    mutationFn: (starred: boolean) => (starred ? unstarEntry(entryId) : starEntry(entryId)),
    onMutate: async (starred) => {
      await queryClient.cancelQueries({ queryKey: QK.entries() });
      await queryClient.cancelQueries({ queryKey: QK.entry(entryId) });

      queryClient.setQueriesData<Page<AnySlimEntry>>({ queryKey: QK.entries() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((e) => (e.id === entryId ? { ...e, starred: !starred } : e)),
        };
      });

      queryClient.setQueryData<AnyEntry>(QK.entry(entryId), (old) => {
        if (!old) return old;
        return { ...old, starred: !starred };
      });
    },
    onError: (err, starred) => {
      // Revert optimistic update
      queryClient.setQueriesData<Page<AnySlimEntry>>({ queryKey: QK.entries() }, (old) => {
        if (!old) return old;
        return { ...old, content: old.content.map((e) => (e.id === entryId ? { ...e, starred } : e)) };
      });
      queryClient.setQueryData<AnyEntry>(QK.entry(entryId), (old) => {
        if (!old) return old;
        return { ...old, starred };
      });
      message.error(getApiErrorMessage(err, 'Failed to update star'));
    },
  });

  return { toggleStar, isStarring };
}
