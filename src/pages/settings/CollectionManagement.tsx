import {useState} from 'react';
import {App, Button, Empty, Popconfirm, Spin, Tag} from 'antd';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteCollection} from '@/api/groups';
import {QK} from '@/utils/queryKeys';
import {useGroups} from '@/hooks/useGroups';
import GroupModal from '@/components/groups/GroupModal';
import {getApiErrorMessage} from '@/utils/apiError';

type Flattened<T> = T & { depth: number; parentId?: string };

// parentId is carried down from the walk: the API models hierarchy as nested
// children only, so an edited collection has no other way to know its parent
function flattenForList<T extends { id: string; name: string; children?: T[] }>(
    items: T[], depth = 0, parentId?: string,
): Flattened<T>[] {
  const result: Flattened<T>[] = [];
  for (const item of items) {
    result.push({...item, depth, parentId});
    if (item.children?.length) {
      result.push(...flattenForList(item.children, depth + 1, item.id));
    }
  }
  return result;
}

export default function CollectionManagement() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { collections, isLoading } = useGroups();
  const [editModal, setEditModal] = useState<{
    open: boolean;
    item: { id: string; name: string; parentId?: string } | null
  }>({open: false, item: null});

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.collections() });
      message.success('Collection deleted');
    },
      onError: (err) => {
          message.error(getApiErrorMessage(err, 'Failed to delete collection'));
      },
  });

  const flatCollections = flattenForList(collections);

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', padding: 24 }} />;

  return (
    <>
      {flatCollections.length === 0 ? (
        <Empty description="No collections yet. Create one from the sidebar." style={{ padding: '24px 0' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {flatCollections.map((col) => (
            <div key={col.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: col.depth * 24 + 12,
              paddingRight: 12,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 8,
              border: '1px solid var(--border-secondary)',
              background: 'var(--bg-surface)',
            }}>
              <Tag className="lynks-chip">{col.name}</Tag>
              <div style={{ display: 'flex', gap: 4 }}>
                <Button type="text" size="small" icon={<EditOutlined />}
                        onClick={() => setEditModal({open: true, item: {id: col.id, name: col.name, parentId: col.parentId}})}/>
                <Popconfirm title="Delete this collection?" onConfirm={() => deleteMutation.mutate(col.id)}
                            okText="Delete" okButtonProps={{ danger: true }}>
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}
      {editModal.item && (
        <GroupModal
          type="collection"
          open={editModal.open}
          onClose={() => setEditModal({ open: false, item: null })}
          editItem={editModal.item}
          collections={collections}
        />
      )}
    </>
  );
}
