import {App} from 'antd';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteFile, deleteLink, deleteNote, deleteSnippet} from '@/api/entries';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';
import type {AnySlimEntry, EntryType, Page} from '@/types';

const deleteByType: Record<EntryType, (id: string) => Promise<void>> = {
  link: deleteLink,
  note: deleteNote,
  snippet: deleteSnippet,
  file: deleteFile,
};

export function useDeleteEntry() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { mutate: deleteEntry, isPending: isDeleting } = useMutation({
    mutationFn: ({ id, type }: { id: string; type: EntryType }) => deleteByType[type](id),
    onSuccess: (_, { id }) => {
      // Remove from all list caches
      queryClient.setQueriesData<Page<AnySlimEntry>>({ queryKey: QK.entries() }, (old) => {
        if (!old) return old;
        return { ...old, content: old.content.filter((e) => e.id !== id), total: old.total - 1 };
      });
      // Remove detail cache
      queryClient.removeQueries({ queryKey: QK.entry(id) });
    },
      onError: (err) => {
          message.error(getApiErrorMessage(err, 'Failed to delete entry'));
      },
  });

  return { deleteEntry, isDeleting };
}
