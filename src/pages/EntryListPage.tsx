import { useCallback, useEffect } from 'react';
import { Button, Empty, Input, Pagination, Segmented, Select, Skeleton, Spin } from 'antd';
import { GlobalOutlined, SortAscendingOutlined, SortDescendingOutlined, SwapOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { buildFilterUrl, parseSearchParams, pathToType } from '@/hooks/useUrlFilterSync';
import { useEntries } from '@/hooks/useEntries';
import { ENTRY_TYPE_LABELS, PAGE_SIZE_OPTIONS, SEARCH_SORT_OPTIONS, SORT_OPTIONS } from '@/utils/constants';
import EntryCard from '@/components/entries/EntryCard';
import ActiveFilters from '@/components/entries/ActiveFilters';
import type { EntryType, SortDirection } from '@/types';

function ListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{
          padding: '18px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-secondary)',
          background: 'var(--bg-surface)',
        }}>
          <Skeleton active avatar={{ shape: 'square', size: 68 }} paragraph={{ rows: 1 }} />
        </div>
      ))}
    </div>
  );
}

export default function EntryListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const entryType: EntryType | null = pathToType[location.pathname] ?? null;
  const { tags, collections, searchQuery, source, sort, direction, page, size } = parseSearchParams(
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  );

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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>
            {searchQuery ? `Search: "${searchQuery}"` : pageTitle}
          </span>
          {!isLoading && total > 0 && (
            <span style={{ fontWeight: 400, fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' }}>
              {searchQuery ? `${total} result${total === 1 ? '' : 's'}` : `(${total})`}
            </span>
          )}
          {isFetching && <Spin size="small" />}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            key={source}
            prefix={<GlobalOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Filter by domain..."
            defaultValue={source}
            onChange={(e) => { if (!e.target.value) commitSource(''); }}
            onPressEnter={(e) => commitSource((e.target as HTMLInputElement).value)}
            allowClear
            style={{ width: 180 }}
            size="middle"
          />
          <Select
            value={sort}
            onChange={(val) => handleSort(val, direction)}
            options={sortOptions}
            style={{ width: 140 }}
            size="middle"
          />
          {sort !== 'mostRelevant' && (
            <Segmented
              size="middle"
              value={direction === 'rand' ? 'desc' : direction}
              onChange={(val) => handleSort(sort, val as SortDirection)}
              options={[
                { value: 'desc', icon: <SortDescendingOutlined /> },
                { value: 'asc', icon: <SortAscendingOutlined /> },
              ]}
            />
          )}
          <Button
            icon={<SwapOutlined />}
            size="middle"
            type={direction === 'rand' ? 'primary' : 'default'}
            onClick={() => handleSort(sort, 'rand')}
            title="Random order"
          />
        </div>
      </div>

      <ActiveFilters />

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <Empty description="Failed to load entries" />
      ) : entries.length === 0 ? (
        <Empty description={searchQuery ? `No results for "${searchQuery}"` : 'No entries found'} style={{ padding: '48px 0' }} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>

          {total > size && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <Pagination
                current={page}
                pageSize={size}
                total={total}
                onChange={handlePage}
                showSizeChanger
                showQuickJumper
                showTotal={(t) => `${t} entries`}
                pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
