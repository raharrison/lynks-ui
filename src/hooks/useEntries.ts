import { useQuery } from '@tanstack/react-query';
import { getEntries, getFiles, getLinks, getNotes, getSnippets, searchEntries } from '@/api/entries';
import type { AnySlimEntry, EntryType, Page, PageRequest } from '@/types';

export interface UseEntriesParams extends PageRequest {
  searchQuery?: string;
  entryType?: EntryType | null;
}

async function fetchEntries({ searchQuery, entryType, ...pageRequest }: UseEntriesParams): Promise<Page<AnySlimEntry>> {
  if (searchQuery) return searchEntries(searchQuery, pageRequest);
  if (entryType === 'link') return getLinks(pageRequest);
  if (entryType === 'note') return getNotes(pageRequest);
  if (entryType === 'snippet') return getSnippets(pageRequest);
  if (entryType === 'file') return getFiles(pageRequest);
  return getEntries(pageRequest);
}

export function useEntries(params: UseEntriesParams) {
  const { entryType, searchQuery, source, page, size, tags, collections, sort, direction } = params;
  return useQuery({
    queryKey: [
      'entries', 'list',
      entryType ?? null,
      searchQuery ?? '',
      source ?? '',
      page ?? 1,
      size ?? 10,
      sort ?? '',
      direction ?? '',
      ...(tags ?? []),
      ...(collections ?? []),
    ],
    queryFn: () => fetchEntries(params),
    staleTime: 30_000,
  });
}
