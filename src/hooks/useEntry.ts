import { useQuery } from '@tanstack/react-query';
import { getEntry, getEntryVersion } from '@/api/entries';
import { QK } from '@/utils/queryKeys';
import type { AnyEntry } from '@/types';

export function useEntry(id: string | undefined, version?: number | null): {
  entry: AnyEntry | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
} {
  const { data: entry, isLoading, isFetching, isError } = useQuery({
    queryKey: QK.entry(id!, version),
    queryFn: () => (version != null ? getEntryVersion(id!, version) : getEntry(id!)),
    enabled: !!id,
  });

  return { entry, isLoading, isFetching, isError };
}
