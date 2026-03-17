import {App} from 'antd';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createComment, deleteComment, getComments, updateComment} from '@/api/comments';
import {QK} from '@/utils/queryKeys';
import {getApiErrorMessage} from '@/utils/apiError';
import {COMMENTS_PAGE_SIZE} from '@/utils/constants';

export function useComments(entryId: string) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QK.comments(entryId),
    queryFn: () => getComments(entryId, { size: COMMENTS_PAGE_SIZE }),
  });

  const addMutation = useMutation({
      mutationFn: (plainContent: string) => createComment(entryId, {plainContent}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.comments(entryId) }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to add comment')),
  });

  const editMutation = useMutation({
      mutationFn: ({id, plainContent}: { id: string; plainContent: string }) =>
          updateComment(entryId, {id, plainContent}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.comments(entryId) }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to update comment')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(entryId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.comments(entryId) }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to delete comment')),
  });

  return {
    comments: data?.content || [],
    isLoading,
    addComment: addMutation.mutate,
    editComment: editMutation.mutate,
    removeComment: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isEditing: editMutation.isPending,
  };
}
