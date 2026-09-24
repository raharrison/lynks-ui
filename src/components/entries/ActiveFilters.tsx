import {Tag} from 'antd';
import {CloseCircleOutlined, GlobalOutlined} from '@ant-design/icons';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {buildFilterUrl, parseSearchParams} from '@/hooks/useUrlFilterSync';
import {useGroups} from '@/hooks/useGroups';

const chipStyle: React.CSSProperties = { fontSize: 'var(--font-size-sm)', padding: '2px 10px', margin: 0 };

export default function ActiveFilters() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { tags, collections, searchQuery, source } = parseSearchParams(searchParams.toString() ? `?${searchParams.toString()}` : '');
  const { flatTags, flatCollections } = useGroups();

  const hasFilters = tags.length > 0 || collections.length > 0 || searchQuery || source;
  if (!hasFilters) return null;

  const removeTag = (tagId: string) =>
    navigate(buildFilterUrl({ tags: tags.filter((t) => t !== tagId) }, location.pathname, location.search));

  const removeCollection = (colId: string) =>
    navigate(buildFilterUrl({ collections: collections.filter((c) => c !== colId) }, location.pathname, location.search));

  const clearAll = () =>
    navigate(location.pathname);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16 }}>
      {searchQuery && (
        <Tag
            className="lynks-chip"
          closable
          onClose={() => navigate(buildFilterUrl({ searchQuery: '' }, location.pathname, location.search))}
          style={chipStyle}
        >
          Search: {searchQuery}
        </Tag>
      )}

      {source && (
        <Tag
          icon={<GlobalOutlined />}
          className="lynks-chip"
          closable
          onClose={() => navigate(buildFilterUrl({ source: '' }, location.pathname, location.search))}
          style={chipStyle}
        >
          {source}
        </Tag>
      )}

      {tags.map((tagId) => {
        const tag = flatTags.find((t) => t.value === tagId);
        return (
            <Tag key={tagId} className="lynks-chip lynks-chip-accent" closable onClose={() => removeTag(tagId)} style={chipStyle}>
            {tag?.label || tagId}
          </Tag>
        );
      })}

      {collections.map((colId) => {
        const col = flatCollections.find((c) => c.value === colId);
        return (
            <Tag key={colId} className="lynks-chip lynks-chip-accent" closable onClose={() => removeCollection(colId)}
                 style={chipStyle}>
            {col?.label || colId}
          </Tag>
        );
      })}

      <Tag
          icon={<CloseCircleOutlined/>}
          className="lynks-chip lynks-chip-clickable"
          style={chipStyle}
          onClick={clearAll}
      >
        Clear all
      </Tag>
    </div>
  );
}
