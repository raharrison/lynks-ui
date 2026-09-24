import {useState} from 'react';
import {App, Button, Empty, Popconfirm, Spin, Tag} from 'antd';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteTag} from '@/api/groups';
import {QK} from '@/utils/queryKeys';
import {useGroups} from '@/hooks/useGroups';
import GroupModal from '@/components/groups/GroupModal';
import {getApiErrorMessage} from '@/utils/apiError';

function flattenForList<T extends { id: string; name: string; children?: T[] }>(items: T[], depth = 0): (T & { depth: number })[] {
  const result: (T & { depth: number })[] = [];
  for (const item of items) {
    result.push({ ...item, depth });
    if (item.children?.length) {
      result.push(...flattenForList(item.children, depth + 1));
    }
  }
  return result;
}

export default function TagManagement() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { tags, isLoading } = useGroups();
  const [editModal, setEditModal] = useState<{ open: boolean; item: { id: string; name: string } | null }>({ open: false, item: null });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.tags() });
      message.success('Tag deleted');
    },
      onError: (err) => {
          message.error(getApiErrorMessage(err, 'Failed to delete tag'));
      },
  });

  const flatTags = flattenForList(tags);

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', padding: 24 }} />;

  return (
    <>
      {flatTags.length === 0 ? (
        <Empty description="No tags yet. Create one from the sidebar." style={{ padding: '24px 0' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {flatTags.map((tag) => (
            <div key={tag.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: tag.depth * 24 + 12,
              paddingRight: 12,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 8,
              border: '1px solid var(--border-secondary)',
              background: 'var(--bg-surface)',
            }}>
                <Tag className="lynks-chip">{tag.name}</Tag>
              <div style={{ display: 'flex', gap: 4 }}>
                <Button type="text" size="small" icon={<EditOutlined />}
                        onClick={() => setEditModal({ open: true, item: { id: tag.id, name: tag.name } })} />
                <Popconfirm title="Delete this tag?" onConfirm={() => deleteMutation.mutate(tag.id)}
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
          type="tag"
          open={editModal.open}
          onClose={() => setEditModal({ open: false, item: null })}
          editItem={editModal.item}
        />
      )}
    </>
  );
}
