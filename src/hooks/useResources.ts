import { App } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteResource, getResources, uploadResource } from '@/api/resources';
import { QK } from '@/utils/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';

export function useResources(entryId: string) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading, isError } = useQuery({
    queryKey: QK.resources(entryId),
    queryFn: () => getResources(entryId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadResource(entryId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.resources(entryId) }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to upload resource')),
  });

  const deleteMutation = useMutation({
    mutationFn: (resourceId: string) => deleteResource(entryId, resourceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.resources(entryId) }),
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to delete resource')),
  });

  return {
    resources,
    isLoading,
    isError,
    upload: uploadMutation.mutate,
    remove: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isRemoving: deleteMutation.isPending,
  };
}
