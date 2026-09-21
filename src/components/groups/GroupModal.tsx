import {useState} from 'react';
import {App, Input, Modal, TreeSelect} from 'antd';
import {useQueryClient} from '@tanstack/react-query';
import {createCollection, createTag, updateCollection, updateTag} from '@/api/groups';
import {getApiErrorMessage} from '@/utils/apiError';
import type {Collection} from '@/types';

interface GroupModalProps {
  type: 'tag' | 'collection';
  open: boolean;
  onClose: () => void;
  collections?: Collection[];
  editItem?: { id: string; name: string; parentId?: string } | null;
}

type TreeSelectNode = { value: string; title: string; children?: TreeSelectNode[] };

// excludeId drops the collection being edited along with its descendants, since
// the server writes parentId unvalidated and would happily build a cycle
function collectionsToTreeSelect(collections: Collection[], excludeId?: string): TreeSelectNode[] {
    return collections
        .filter((c) => c.id !== excludeId)
        .map((c) => {
            const children = collectionsToTreeSelect(c.children, excludeId);
            return {value: c.id, title: c.name, children: children.length ? children : undefined};
        });
}

export default function GroupModal({ type, open, onClose, collections = [], editItem }: GroupModalProps) {
  const { message } = App.useApp();
  const [name, setName] = useState(editItem?.name || '');
  const [parentId, setParentId] = useState<string | undefined>(editItem?.parentId);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

    const formKey = open ? editItem?.id ?? 'new' : null;
    const [lastFormKey, setLastFormKey] = useState(formKey);

    if (formKey !== lastFormKey) {
        setLastFormKey(formKey);
        setName(editItem?.name || '');
        setParentId(editItem?.parentId);
    }

  const isEditing = !!editItem;

  const handleOk = async () => {
    if (!name.trim()) {
      message.warning('Please enter a name');
      return;
    }
    setLoading(true);
    try {
      if (type === 'tag') {
        if (isEditing) {
          await updateTag({ id: editItem.id, name: name.trim() });
        } else {
          await createTag({ name: name.trim() });
        }
      } else {
        if (isEditing) {
          await updateCollection({ id: editItem.id, name: name.trim(), parentId: parentId || null });
        } else {
          await createCollection({ name: name.trim(), parentId: parentId || null });
        }
      }
      queryClient.invalidateQueries({ queryKey: [type === 'tag' ? 'tags' : 'collections'] });
      message.success(`${type === 'tag' ? 'Tag' : 'Collection'} ${isEditing ? 'updated' : 'created'}`);
      setName('');
      setParentId(undefined);
      onClose();
    } catch (err) {
      message.error(getApiErrorMessage(err, `Failed to ${isEditing ? 'update' : 'create'} ${type}`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`${isEditing ? 'Edit' : 'New'} ${type === 'tag' ? 'Tag' : 'Collection'}`}
      open={open}
      onOk={handleOk}
      onCancel={() => { setName(''); setParentId(undefined); onClose(); }}
      confirmLoading={loading}
      destroyOnHidden
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={handleOk}
          autoFocus
        />
        {type === 'collection' && (
          <TreeSelect
            placeholder="Parent collection (optional)"
            treeData={collectionsToTreeSelect(collections, editItem?.id)}
            value={parentId}
            onChange={setParentId}
            allowClear
            treeDefaultExpandAll
            style={{ width: '100%' }}
          />
        )}
      </div>
    </Modal>
  );
}
