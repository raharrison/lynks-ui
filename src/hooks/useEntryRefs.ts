import { useQuery } from '@tanstack/react-query';
import { getEntryRefs } from '@/api/entries';
import { QK } from '@/utils/queryKeys';

export function useEntryRefs(entryId: string) {
  const { data: refs, isLoading } = useQuery({
    queryKey: QK.refs(entryId),
    queryFn: () => getEntryRefs(entryId),
  });

  return { refs, isLoading };
}
