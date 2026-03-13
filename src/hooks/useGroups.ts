import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCollections, getTags } from '@/api/groups';
import { QK } from '@/utils/queryKeys';
import { flattenCollections, flattenTags } from '@/utils/groups';
import type { Collection, Tag } from '@/types';
export { flattenTags, flattenCollections }; // re-export for existing callers

export function useGroups(): {
  tags: Tag[];
  collections: Collection[];
  flatTags: { label: string; value: string }[];
  flatCollections: { label: string; value: string }[];
  isLoading: boolean;
} {
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: QK.tags(),
    queryFn: getTags,
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: QK.collections(),
    queryFn: getCollections,
  });

  const flatTags = useMemo(() => flattenTags(tags), [tags]);
  const flatCollections = useMemo(() => flattenCollections(collections), [collections]);

  return {
    tags,
    collections,
    flatTags,
    flatCollections,
    isLoading: tagsLoading || collectionsLoading,
  };
}
