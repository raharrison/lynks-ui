import { App, Button, Form, Input } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useSaveEntry } from '@/hooks/useSaveEntry';
import { useEntryFormGroups } from '@/hooks/useEntryFormGroups';
import TagCollectionSelect from '@/components/common/TagCollectionSelect';
import { getApiErrorMessage } from '@/utils/apiError';
import type { FileEntry, NewFile } from '@/types';

interface FileFormProps {
  entry?: FileEntry;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function FileForm({ entry, onSuccess, onCancel, onDirtyChange }: FileFormProps) {
  const { message } = App.useApp();
  const isEdit = !!entry;
  const [form] = Form.useForm();
  const { tags, setTags, collections, setCollections } = useEntryFormGroups(entry);
  const mutation = useSaveEntry('file', entry?.id);

  const handleFinish = (values: { title: string }) => {
    const payload: NewFile = {
      ...(isEdit && { id: entry.id }),
      title: values.title,
      tags,
      collections,
    };
    mutation.mutate(payload, {
      onSuccess: (data) => {
        message.success(isEdit ? 'File updated' : 'File entry created');
        onSuccess?.(data.id);
      },
      onError: (err) => message.error(getApiErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} file entry`)),
    });
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      layout="vertical"
      initialValues={{ title: entry?.title }}
      onValuesChange={() => onDirtyChange?.(true)}
    >
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input placeholder="File title" />
      </Form.Item>
      <TagCollectionSelect
        selectedTags={tags}
        selectedCollections={collections}
        onTagsChange={setTags}
        onCollectionsChange={setCollections}
      />
      <Form.Item style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={mutation.isPending} style={{ borderRadius: 'var(--radius-pill)' }}>
            {isEdit ? 'Save' : 'Create File Entry'}
          </Button>
          {onCancel && <Button onClick={onCancel} style={{ borderRadius: 'var(--radius-pill)' }}>Cancel</Button>}
        </div>
      </Form.Item>
    </Form>
  );
}
