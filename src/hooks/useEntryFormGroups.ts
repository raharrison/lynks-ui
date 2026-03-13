import { useState } from 'react';
import type { AnyEntry } from '@/types';

/**
 * Shared tags/collections state for entry forms.
 * Initialises from the existing entry when editing, empty arrays for create.
 */
export function useEntryFormGroups(entry?: Pick<AnyEntry, 'tags' | 'collections'>) {
  const [tags, setTags] = useState<string[]>(() => entry?.tags.map((t) => t.id) ?? []);
  const [collections, setCollections] = useState<string[]>(() => entry?.collections.map((c) => c.id) ?? []);
  return { tags, setTags, collections, setCollections };
}
