import {useCallback, useEffect, useState} from 'react';
import {Button, Empty, Input, Pagination, Segmented, Select, Space, Spin} from 'antd';
import {
    CheckOutlined,
    GlobalOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    SwapOutlined,
} from '@ant-design/icons';
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {buildFilterUrl, parseSearchParams} from '@/hooks/useUrlFilterSync';
import {useEntries} from '@/hooks/useEntries';
import {useStarEntry} from '@/hooks/useStarEntry';
import {ENTRY_TYPE_LABELS, PAGE_SIZE_OPTIONS, SEARCH_SORT_OPTIONS, SORT_OPTIONS} from '@/utils/constants';
import {ENTRY_PATH_PREFIX} from '@/utils/format';
import EntryCard from '@/components/entries/EntryCard';
import EntryListSkeleton from '@/components/entries/EntryListSkeleton';
import ActiveFilters from '@/components/entries/ActiveFilters';
import PageHeader from '@/components/common/PageHeader';
import BottomSheet from '@/components/common/BottomSheet';
import {NAV_ITEMS} from '@/components/layout/navigation';
import {useIsMobile} from '@/hooks/useIsMobile';
import type {EntryType, SortDirection} from '@/types';

const LIST_NAV = NAV_ITEMS.filter((n) => n.key !== '/digest');

const DIRECTION_OPTIONS: { value: SortDirection; label: string; icon: React.ReactNode }[] = [
    {value: 'desc', label: 'Descending', icon: <SortDescendingOutlined/>},
    {value: 'asc', label: 'Ascending', icon: <SortAscendingOutlined/>},
    {value: 'rand', label: 'Random', icon: <SwapOutlined/>},
];

function SortSheet({open, onClose, sort, direction, options, onChange}: {
    open: boolean;
    onClose: () => void;
    sort: string;
    direction: SortDirection;
    options: { label: string; value: string }[];
    onChange: (sort: string, direction: SortDirection) => void;
}) {
    return (
        <BottomSheet open={open} onClose={onClose} title="Sort by">
            <div className="sheet-list" style={{marginBottom: 16}}>
                {options.map((o) => (
                    <button key={o.value} type="button"
                            className={`sheet-list-item${o.value === sort ? ' sheet-list-item--active' : ''}`}
                            onClick={() => {
                                onChange(o.value, direction);
                                onClose();
                            }}>
                        <span className="sheet-list-label">{o.label}</span>
                        {o.value === sort && <CheckOutlined/>}
                    </button>
                ))}
            </div>
            {sort !== 'mostRelevant' && (
                <>
                    <div className="sheet-section-label">Order</div>
                    <Segmented
                        block
                        value={direction}
                        onChange={(val) => {
                            onChange(sort, val as SortDirection);
                            onClose();
                        }}
                        options={DIRECTION_OPTIONS}
                    />
                </>
            )}
        </BottomSheet>
    );
}

// Reverse of ENTRY_PATH_PREFIX: 'links' → 'link', etc.
const prefixToType: Record<string, EntryType> = Object.fromEntries(
    Object.entries(ENTRY_PATH_PREFIX).map(([type, prefix]) => [prefix, type as EntryType])
);

export default function EntryListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {entryType: entryTypeParam} = useParams<{ entryType?: string }>();

  const entryType: EntryType | null = entryTypeParam ? (prefixToType[entryTypeParam] ?? null) : null;
  const { tags, collections, searchQuery, source, sort, direction, page, size } = parseSearchParams(
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  );

  const {toggleStar} = useStarEntry();
  const isMobile = useIsMobile();
  const [sortOpen, setSortOpen] = useState(false);

  // Reset sort when search is cleared
  useEffect(() => {
    if (!searchQuery && sort === 'mostRelevant') {
      navigate(buildFilterUrl({ sort: 'dateUpdated', direction: 'desc' }, location.pathname, location.search), { replace: true });
    }
  }, [searchQuery, sort, navigate, location.pathname, location.search]);

  const { data, isLoading, isFetching, isError } = useEntries({
    entryType, searchQuery, source, page, size, tags, collections, sort, direction,
  });

  const entries = data?.content ?? [];
  const total = data?.total ?? 0;

  const pageTitle = entryType ? `${ENTRY_TYPE_LABELS[entryType]}s` : 'Entries';

  useEffect(() => {
    document.title = searchQuery ? `Search: ${searchQuery} - Lynks` : `${pageTitle} - Lynks`;
  }, [pageTitle, searchQuery]);

  const sortOptions = searchQuery ? SEARCH_SORT_OPTIONS : SORT_OPTIONS;

  const handleSort = useCallback((val: string, dir: SortDirection) =>
    navigate(buildFilterUrl({ sort: val, direction: dir }, location.pathname, location.search)),
  [navigate, location.pathname, location.search]);

  const commitSource = useCallback((val: string) =>
    navigate(buildFilterUrl({ source: val.trim() }, location.pathname, location.search)),
  [navigate, location.pathname, location.search]);

  const handlePage = useCallback((p: number, s: number) =>
    navigate(buildFilterUrl({ page: s !== size ? 1 : p, size: s }, location.pathname, location.search)),
  [navigate, location.pathname, location.search, size]);

  const sourceFilter = (
      <Input
          key={source}
          prefix={<GlobalOutlined style={{ color: 'var(--text-muted)' }} />}
          placeholder="Filter by domain..."
          defaultValue={source}
          onChange={(e) => { if (!e.target.value) commitSource(''); }}
          onPressEnter={(e) => commitSource((e.target as HTMLInputElement).value)}
          enterKeyHint="search"
          allowClear
          className="entry-list-source"
          size="middle"
      />
  );

  const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? 'Sort';
  const directionIcon = DIRECTION_OPTIONS.find((o) => o.value === direction)?.icon;

  return (
    <div>
      <PageHeader
          title={searchQuery ? `Search: "${searchQuery}"` : pageTitle}
          meta={(!isLoading && total > 0) || isFetching ? (
              <>
                {!isLoading && total > 0 && (searchQuery ? `${total} result${total === 1 ? '' : 's'}` : `(${total})`)}
                {isFetching && <Spin size="small" />}
              </>
          ) : null}
          actions={!isMobile && (
              <div className="entry-list-toolbar">
                {sourceFilter}
                <Select
                    value={sort}
                    onChange={(val) => handleSort(val, direction)}
                    options={sortOptions}
                    className="entry-list-sort"
                    size="middle"
                />
                {sort !== 'mostRelevant' && (
                    <Space.Compact>
                      {DIRECTION_OPTIONS.map((o) => (
                          <Button
                              key={o.value}
                              size="middle"
                              type={direction === o.value ? 'primary' : 'default'}
                              icon={o.icon}
                              onClick={() => handleSort(sort, o.value)}
                              title={o.value === 'rand' ? 'Random order' : o.label}
                          />
                      ))}
                    </Space.Compact>
                )}
              </div>
          )}
      />

      {isMobile && (
          <>
            <div className="type-chips" role="tablist" aria-label="Entry type">
              {LIST_NAV.map((n) => {
                const active = n.key === location.pathname;
                return (
                    <button key={n.key} type="button" role="tab" aria-selected={active}
                            className={`type-chip${active ? ' type-chip--active' : ''}`}
                            onClick={() => navigate(buildFilterUrl({}, n.key, location.search))}>
                      {n.icon}{n.shortLabel}
                    </button>
                );
              })}
            </div>
            <div className="entry-list-toolbar" style={{ marginBottom: 12 }}>
              {sourceFilter}
              <Button icon={directionIcon} onClick={() => setSortOpen(true)} aria-label={`Sort: ${sortLabel}`}>
                {sortLabel}
              </Button>
            </div>
            <SortSheet open={sortOpen} onClose={() => setSortOpen(false)} sort={sort} direction={direction}
                       options={sortOptions} onChange={handleSort} />
          </>
      )}

      <ActiveFilters />

      {isLoading ? (
          <EntryListSkeleton/>
      ) : isError ? (
        <Empty description="Failed to load entries" />
      ) : entries.length === 0 ? (
        <Empty description={searchQuery ? `No results for "${searchQuery}"` : 'No entries found'} style={{ padding: '48px 0' }} />
      ) : (
        <>
          <div className="entry-list">
            {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onStar={toggleStar}/>
            ))}
          </div>

          {total > size && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <Pagination
                current={page}
                pageSize={size}
                total={total}
                onChange={handlePage}
                simple={isMobile}
                showSizeChanger={!isMobile}
                showQuickJumper={!isMobile}
                showTotal={isMobile ? undefined : (t) => `${t} entries`}
                pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
