import { Select, Typography } from 'antd';
import { useGroups } from '@/hooks/useGroups';

interface TagCollectionSelectProps {
  selectedTags: string[];
  selectedCollections: string[];
  onTagsChange: (tags: string[]) => void;
  onCollectionsChange: (collections: string[]) => void;
}

export default function TagCollectionSelect({
  selectedTags, selectedCollections, onTagsChange, onCollectionsChange,
}: TagCollectionSelectProps) {
  const { flatTags, flatCollections } = useGroups();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <Typography.Text style={{ fontSize: 'var(--font-size-sm)', display: 'block', marginBottom: 4 }}>Tags</Typography.Text>
        <Select
          mode="multiple"
          placeholder="Select tags"
          value={selectedTags}
          onChange={onTagsChange}
          options={flatTags}
          style={{ width: '100%' }}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
      <div>
        <Typography.Text style={{ fontSize: 'var(--font-size-sm)', display: 'block', marginBottom: 4 }}>Collections</Typography.Text>
        <Select
          mode="multiple"
          placeholder="Select collections"
          value={selectedCollections}
          onChange={onCollectionsChange}
          options={flatCollections}
          style={{ width: '100%' }}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>
    </div>
  );
}
