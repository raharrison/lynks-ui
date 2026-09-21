import {useCallback} from 'react';
import {App} from 'antd';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {starEntry, unstarEntry} from '@/api/entries';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';
import type {AnyEntry, AnySlimEntry, Digest, Page} from '@/types';

export function useStarEntry(): { toggleStar: (id: string, starred: boolean) => void; isStarring: boolean } {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const {mutate, isPending: isStarring} = useMutation({
    mutationFn: ({id, starred}: { id: string; starred: boolean }) =>
        (starred ? unstarEntry(id) : starEntry(id)),
    onMutate: async ({id, starred}) => {
      await queryClient.cancelQueries({ queryKey: QK.entries() });
      await queryClient.cancelQueries({queryKey: QK.entry(id)});
        await queryClient.cancelQueries({queryKey: QK.digest()});

      queryClient.setQueriesData<Page<AnySlimEntry>>({ queryKey: QK.entries() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((e) => (e.id === id ? {...e, starred: !starred} : e)),
        };
      });

      queryClient.setQueryData<AnyEntry>(QK.entry(id), (old) => {
        if (!old) return old;
        return { ...old, starred: !starred };
      });

        queryClient.setQueryData<Digest>(QK.digest(), (old) => {
            if (!old) return old;
            return {...old, links: old.links.map((l) => (l.id === id ? {...l, starred: !starred} : l))};
        });
    },
    onError: (err, {id, starred}) => {
      queryClient.setQueriesData<Page<AnySlimEntry>>({ queryKey: QK.entries() }, (old) => {
        if (!old) return old;
        return {...old, content: old.content.map((e) => (e.id === id ? {...e, starred} : e))};
      });
      queryClient.setQueryData<AnyEntry>(QK.entry(id), (old) => {
        if (!old) return old;
        return { ...old, starred };
      });
        queryClient.setQueryData<Digest>(QK.digest(), (old) => {
            if (!old) return old;
            return {...old, links: old.links.map((l) => (l.id === id ? {...l, starred} : l))};
        });
      message.error(getApiErrorMessage(err, 'Failed to update star'));
    },
  });

  const toggleStar = useCallback((id: string, starred: boolean) => mutate({id, starred}), [mutate]);
  return { toggleStar, isStarring };
}
