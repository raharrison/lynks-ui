import {Tag, Tooltip} from 'antd';
import {CheckOutlined, FolderOutlined, TagsOutlined} from '@ant-design/icons';
import {useGroupFilter} from '@/hooks/useGroupFilter';
import type {Collection, Tag as TagType} from '@/types';

interface EntryTagChipProps {
  tag: TagType;
  clickable?: boolean;
}

export function EntryTagChip({ tag, clickable = true }: EntryTagChipProps) {
  const { toggle, isActive } = useGroupFilter('tags', tag.id);

  const chip = (
    <Tag
      icon={isActive ? <CheckOutlined /> : <TagsOutlined />}
      className={[
          'lynks-chip',
          isActive ? 'lynks-chip-accent' : '',
          clickable ? 'lynks-chip-clickable' : '',
      ].filter(Boolean).join(' ')}
      style={{fontSize: 'var(--font-size-sm)', padding: '2px 10px', margin: 0}}
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
      className={[
          'lynks-chip',
          isActive ? 'lynks-chip-accent' : '',
          clickable ? 'lynks-chip-clickable' : '',
      ].filter(Boolean).join(' ')}
      style={{fontSize: 'var(--font-size-sm)', padding: '2px 10px', margin: 0}}
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
