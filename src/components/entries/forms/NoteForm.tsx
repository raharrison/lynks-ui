import {useState} from 'react';
import {App, Button, Form, Input} from 'antd';
import {SaveOutlined} from '@ant-design/icons';
import {useSaveEntry} from '@/hooks/useSaveEntry';
import {useEntryFormGroups} from '@/hooks/useEntryFormGroups';
import RichEditor from '@/components/common/editor/RichEditor';
import TagCollectionSelect from '@/components/common/TagCollectionSelect';
import {getApiErrorMessage} from '@/utils/apiError';
import type {NewNote, Note} from '@/types';

interface NoteFormProps {
  entry?: Note;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function NoteForm({ entry, onSuccess, onCancel, onDirtyChange }: NoteFormProps) {
  const { message } = App.useApp();
  const isEdit = !!entry;
  const [form] = Form.useForm();
  const { tags, setTags, collections, setCollections } = useEntryFormGroups(entry);
    const [content, setContent] = useState(entry?.plainContent || '');
  const mutation = useSaveEntry('note', entry?.id);

  const handleFinish = (values: { title: string }) => {
    const payload: NewNote = {
      ...(isEdit && { id: entry.id }),
      title: values.title,
        content,
      tags,
      collections,
    };
    mutation.mutate(payload, {
      onSuccess: (data) => {
        message.success(isEdit ? 'Note updated' : 'Note created');
        onSuccess?.(data.id);
      },
      onError: (err) => message.error(getApiErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} note`)),
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
        <Input placeholder="Note title" />
      </Form.Item>
      <Form.Item label="Content" required>
          <RichEditor value={content} onChange={(v) => {
              setContent(v);
              onDirtyChange?.(true);
          }} minHeight={400}/>
      </Form.Item>
      <TagCollectionSelect
        selectedTags={tags}
        selectedCollections={collections}
        onTagsChange={setTags}
        onCollectionsChange={setCollections}
      />
      <Form.Item style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={mutation.isPending}
            disabled={!content.trim()}
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            {isEdit ? 'Save' : 'Create Note'}
          </Button>
          {onCancel && <Button onClick={onCancel} style={{ borderRadius: 'var(--radius-pill)' }}>Cancel</Button>}
        </div>
      </Form.Item>
    </Form>
  );
}
