import { Tag, Tooltip } from 'antd';
import { CheckOutlined, FolderOutlined, TagsOutlined } from '@ant-design/icons';
import { useGroupFilter } from '@/hooks/useGroupFilter';
import type { Collection, Tag as TagType } from '@/types';

interface EntryTagChipProps {
  tag: TagType;
  clickable?: boolean;
}

export function EntryTagChip({ tag, clickable = true }: EntryTagChipProps) {
  const { toggle, isActive } = useGroupFilter('tags', tag.id);

  const chip = (
    <Tag
      icon={isActive ? <CheckOutlined /> : <TagsOutlined />}
      color={isActive ? 'blue' : 'cyan'}
      style={{
        fontSize: 'var(--font-size-sm)',
        padding: '2px 10px',
        margin: 0,
        cursor: clickable ? 'pointer' : 'default',
        fontWeight: 500,
        outline: isActive ? '2px solid var(--accent)' : undefined,
      }}
      onClick={clickable ? toggle : undefined}
    >
      {tag.name}
    </Tag>
  );

  if (!clickable) return chip;
  return (
    <Tooltip title={isActive ? 'Remove tag filter' : 'Filter by this tag'} mouseEnterDelay={0.5}>
      {chip}
    </Tooltip>
  );
}

interface EntryCollectionChipProps {
  collection: Collection;
  clickable?: boolean;
}

export function EntryCollectionChip({ collection, clickable = true }: EntryCollectionChipProps) {
  const { toggle, isActive } = useGroupFilter('collections', collection.id);

  const chip = (
    <Tag
      icon={isActive ? <CheckOutlined /> : <FolderOutlined />}
      color={isActive ? 'blue' : 'geekblue'}
      style={{
        fontSize: 'var(--font-size-sm)',
        padding: '2px 10px',
        margin: 0,
        cursor: clickable ? 'pointer' : 'default',
        fontWeight: 500,
        outline: isActive ? '2px solid var(--accent)' : undefined,
      }}
      onClick={clickable ? toggle : undefined}
    >
      {collection.name}
    </Tag>
  );

  if (!clickable) return chip;
  return (
    <Tooltip title={isActive ? 'Remove collection filter' : 'Filter by this collection'} mouseEnterDelay={0.5}>
      {chip}
    </Tooltip>
  );
}
