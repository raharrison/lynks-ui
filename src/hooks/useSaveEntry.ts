import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createFile, createLink, createNote, createSnippet,
  updateFile, updateLink, updateNote, updateSnippet,
} from '@/api/entries';
import { QK } from '@/utils/queryKeys';
import type { AnyEntry, EntryType, NewAnyEntry, NewFile, NewLink, NewNote, NewSnippet } from '@/types';

const createFns: Record<EntryType, (p: NewAnyEntry) => Promise<AnyEntry>> = {
  link: (p) => createLink(p as NewLink),
  note: (p) => createNote(p as NewNote),
  snippet: (p) => createSnippet(p as NewSnippet),
  file: (p) => createFile(p as NewFile),
};

const updateFns: Record<EntryType, (p: NewAnyEntry) => Promise<AnyEntry>> = {
  link: (p) => updateLink(p as NewLink),
  note: (p) => updateNote(p as NewNote),
  snippet: (p) => updateSnippet(p as NewSnippet),
  file: (p) => updateFile(p as NewFile),
};

/**
 * Unified create/update hook for all entry types.
 * Pass entryId for edit mode; omit for create mode.
 * Cache invalidation is handled automatically.
 */
export function useSaveEntry(type: EntryType, entryId?: string) {
  const queryClient = useQueryClient();
  const isEdit = !!entryId;

  return useMutation({
    mutationFn: (payload: NewAnyEntry) =>
      isEdit ? updateFns[type](payload) : createFns[type](payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: QK.entries() });
      // For updates, populate the detail cache directly from the response — no extra fetch needed
      if (entryId) queryClient.setQueryData(QK.entry(entryId), saved);
    },
  });
}
