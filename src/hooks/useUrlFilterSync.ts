import type { EntryType, SortDirection } from '@/types';
import { ENTRY_PATH_PREFIX } from '@/utils/format';

const DEFAULTS = {
  sort: 'dateUpdated',
  direction: 'desc' as SortDirection,
  page: 1,
  size: 25,
};

// Derived from ENTRY_PATH_PREFIX so the two maps can never diverge
export const pathToType: Record<string, EntryType | null> = {
  '/': null,
  ...Object.fromEntries(
    Object.entries(ENTRY_PATH_PREFIX).map(([type, prefix]) => [`/${prefix}`, type as EntryType])
  ),
};

export function parseSearchParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    tags: params.get('tags')?.split(',').filter(Boolean) || [],
    collections: params.get('collections')?.split(',').filter(Boolean) || [],
    searchQuery: params.get('q') || '',
    source: params.get('source') || '',
    sort: params.get('sort') || DEFAULTS.sort,
    direction: (params.get('dir') || DEFAULTS.direction) as SortDirection,
    page: Number(params.get('page')) || DEFAULTS.page,
    size: Number(params.get('size')) || DEFAULTS.size,
  };
}

function buildSearchParams(state: {
  tags: string[];
  collections: string[];
  searchQuery: string;
  source: string;
  sort: string;
  direction: SortDirection;
  page: number;
  size: number;
}): string {
  const params = new URLSearchParams();
  if (state.tags.length > 0) params.set('tags', state.tags.join(','));
  if (state.collections.length > 0) params.set('collections', state.collections.join(','));
  if (state.searchQuery) params.set('q', state.searchQuery);
  if (state.source) params.set('source', state.source);
  if (state.sort !== DEFAULTS.sort) params.set('sort', state.sort);
  if (state.direction !== DEFAULTS.direction) params.set('dir', state.direction);
  if (state.page !== DEFAULTS.page) params.set('page', String(state.page));
  if (state.size !== DEFAULTS.size) params.set('size', String(state.size));
  const str = params.toString();
  return str ? `?${str}` : '';
}

export const LIST_PATHS = Object.keys(pathToType);

/**
 * Build a URL for a list page by merging overrides onto the CURRENT URL params
 * (reads directly from window.location.search — no async store lag).
 */
export function buildFilterUrl(
  overrides: Partial<{
    tags: string[];
    collections: string[];
    searchQuery: string;
    source: string;
    sort: string;
    direction: SortDirection;
    page: number;
    size: number;
  }>,
  basePath = '/',
  search = window.location.search,
): string {
  const current = parseSearchParams(search);
  const merged = {
    tags: overrides.tags ?? current.tags,
    collections: overrides.collections ?? current.collections,
    searchQuery: overrides.searchQuery ?? current.searchQuery,
    source: overrides.source ?? current.source,
    sort: overrides.sort ?? current.sort,
    direction: overrides.direction ?? current.direction,
    page: overrides.page ?? DEFAULTS.page, // reset page on filter changes
    size: overrides.size ?? current.size,
  };
  return `${basePath}${buildSearchParams(merged)}`;
}
