import { useLocation, useNavigate } from 'react-router-dom';
import { buildFilterUrl, LIST_PATHS, parseSearchParams } from './useUrlFilterSync';

/**
 * Per-item hook for toggling a single tag or collection filter.
 * Used by EntryTagChip / EntryCollectionChip.
 */
export function useGroupFilter(type: 'tags' | 'collections', id: string) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const onListPage = LIST_PATHS.includes(pathname);
  const current = parseSearchParams(search)[type];
  const isActive = onListPage && current.includes(id);
  const basePath = onListPage ? pathname : '/';

  const toggle = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newIds = isActive ? current.filter((v) => v !== id) : [...current, id];
    navigate(buildFilterUrl({ [type]: newIds }, basePath, search));
  };

  return { toggle, isActive };
}

/**
 * Multi-item hook that exposes the currently-active filters and toggle functions
 * for arbitrary ids. Used by AppSidebar where the id is only known at event time.
 */
export function useGroupFilters() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const onListPage = LIST_PATHS.includes(pathname);
  const basePath = onListPage ? pathname : '/';
  const { tags: selectedTags, collections: selectedCollections } = onListPage
    ? parseSearchParams(search)
    : { tags: [] as string[], collections: [] as string[] };

  const toggleTag = (id: string) => {
    const newTags = selectedTags.includes(id)
      ? selectedTags.filter((t) => t !== id)
      : [...selectedTags, id];
    navigate(buildFilterUrl({ tags: newTags }, basePath, search));
  };

  const toggleCollection = (id: string) => {
    const newCols = selectedCollections.includes(id)
      ? selectedCollections.filter((c) => c !== id)
      : [...selectedCollections, id];
    navigate(buildFilterUrl({ collections: newCols }, basePath, search));
  };

  return { selectedTags, selectedCollections, toggleTag, toggleCollection };
}
