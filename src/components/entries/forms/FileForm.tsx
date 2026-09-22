import {useState} from 'react';
import {App, Button, Form, Input, Upload} from 'antd';
import {InboxOutlined, SaveOutlined} from '@ant-design/icons';
import {useSaveEntry} from '@/hooks/useSaveEntry';
import {useEntryFormGroups} from '@/hooks/useEntryFormGroups';
import TagCollectionSelect from '@/components/common/TagCollectionSelect';
import {uploadResource} from '@/api/resources';
import {getApiErrorMessage} from '@/utils/apiError';
import type {FileEntry, NewFile} from '@/types';

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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
  const mutation = useSaveEntry('file', entry?.id);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        form.setFieldValue('title', nameWithoutExt);
        onDirtyChange?.(true);
        return false;
    };

    const handleFinish = async (values: { title: string }) => {
    const payload: NewFile = {
      ...(isEdit && { id: entry.id }),
      title: values.title,
      tags,
      collections,
    };
        setSubmitting(true);
        try {
            const saved = await mutation.mutateAsync(payload);
            if (!isEdit && selectedFile) {
                await uploadResource(saved.id, selectedFile);
            }
            message.success(isEdit ? 'File updated' : 'File created');
            onSuccess?.(saved.id);
        } catch (err) {
            message.error(getApiErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} file`));
        } finally {
            setSubmitting(false);
        }
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      layout="vertical"
      initialValues={{ title: entry?.title }}
      onValuesChange={() => onDirtyChange?.(true)}
    >
        {!isEdit && (
            <Form.Item label="File" required>
                <Upload.Dragger
                    beforeUpload={handleFileSelect}
                    maxCount={1}
                    fileList={selectedFile ? [{uid: '1', name: selectedFile.name, status: 'done' as const}] : []}
                    showUploadList={{showRemoveIcon: false}}
                >
                    <p className="ant-upload-drag-icon"><InboxOutlined/></p>
                    <p className="ant-upload-text">Click or drag a file here</p>
                </Upload.Dragger>
            </Form.Item>
        )}
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input autoFocus={isEdit} placeholder="File title"/>
      </Form.Item>
      <TagCollectionSelect
        selectedTags={tags}
        selectedCollections={collections}
        onTagsChange={setTags}
        onCollectionsChange={setCollections}
      />
      <Form.Item style={{ marginTop: 20 }}>
          <div className="entry-form-actions">
            <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined/>}
                loading={submitting}
                disabled={!isEdit && !selectedFile}
                style={{borderRadius: 'var(--radius-pill)'}}
            >
                {isEdit ? 'Save' : 'Create File'}
          </Button>
          {onCancel && <Button onClick={onCancel} style={{ borderRadius: 'var(--radius-pill)' }}>Cancel</Button>}
        </div>
      </Form.Item>
    </Form>
  );
}
