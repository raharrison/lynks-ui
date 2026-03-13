import { useState } from 'react';
import { App, Button, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useSaveEntry } from '@/hooks/useSaveEntry';
import { useEntryFormGroups } from '@/hooks/useEntryFormGroups';
import RichEditor from '@/components/common/editor/RichEditor';
import TagCollectionSelect from '@/components/common/TagCollectionSelect';
import { getApiErrorMessage } from '@/utils/apiError';
import type { NewSnippet, Snippet } from '@/types';

interface SnippetFormProps {
  entry?: Snippet;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function SnippetForm({ entry, onSuccess, onCancel, onDirtyChange }: SnippetFormProps) {
  const { message } = App.useApp();
  const isEdit = !!entry;
  const { tags, setTags, collections, setCollections } = useEntryFormGroups(entry);
  const [plainText, setPlainText] = useState(entry?.plainText || '');
  const mutation = useSaveEntry('snippet', entry?.id);

  const handleSave = () => {
    const payload: NewSnippet = {
      ...(isEdit && { id: entry.id }),
      plainText,
      tags,
      collections,
    };
    mutation.mutate(payload, {
      onSuccess: (data) => {
        message.success(isEdit ? 'Snippet updated' : 'Snippet created');
        onSuccess?.(data.id);
      },
      onError: (err) => message.error(getApiErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} snippet`)),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Typography.Text style={{ display: 'block', marginBottom: 6 }}>Content</Typography.Text>
        <RichEditor value={plainText} onChange={(v) => { setPlainText(v); onDirtyChange?.(true); }} minHeight={300} />
      </div>
      <TagCollectionSelect
        selectedTags={tags}
        selectedCollections={collections}
        onTagsChange={setTags}
        onCollectionsChange={setCollections}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={mutation.isPending}
          disabled={!plainText.trim()}
          style={{ borderRadius: 'var(--radius-pill)' }}
        >
          {isEdit ? 'Save' : 'Create Snippet'}
        </Button>
        {onCancel && <Button onClick={onCancel} style={{ borderRadius: 'var(--radius-pill)' }}>Cancel</Button>}
      </div>
    </div>
  );
}
