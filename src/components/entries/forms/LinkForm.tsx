import {useEffect, useRef, useState} from 'react';
import {App, Button, Form, Input, Switch, Tag, Tooltip} from 'antd';
import {BulbOutlined, SaveOutlined} from '@ant-design/icons';
import {isAxiosError} from 'axios';
import {suggestLink} from '@/api/suggest';
import {useSaveEntry} from '@/hooks/useSaveEntry';
import {useEntryFormGroups} from '@/hooks/useEntryFormGroups';
import TagCollectionSelect from '@/components/common/TagCollectionSelect';
import {getApiErrorMessage} from '@/utils/apiError';
import type {Link, NewLink} from '@/types';

interface LinkFormProps {
  entry?: Link;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function LinkForm({ entry, onSuccess, onCancel, onDirtyChange }: LinkFormProps) {
  const { message } = App.useApp();
  const isEdit = !!entry;
  const [form] = Form.useForm();
  const { tags, setTags, collections, setCollections } = useEntryFormGroups(entry);
  const [suggesting, setSuggesting] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const suggestControllerRef = useRef<AbortController | null>(null);
  const mutation = useSaveEntry('link', entry?.id);

  useEffect(() => {
    return () => { suggestControllerRef.current?.abort(); };
  }, []);

  const handleSuggest = async () => {
    const url = form.getFieldValue('url');
    if (!url) return;
    suggestControllerRef.current?.abort();
    const controller = new AbortController();
    suggestControllerRef.current = controller;
    setSuggesting(true);
    setThumbnail(null);
    setKeywords([]);
    try {
      const suggestion = await suggestLink(url);
      if (!controller.signal.aborted && form.getFieldValue('url') === url) {
        if (suggestion.title) form.setFieldValue('title', suggestion.title);
        if (suggestion.tags.length) setTags(suggestion.tags.map((t) => t.id));
        if (suggestion.collections.length) setCollections(suggestion.collections.map((c) => c.id));
        if (suggestion.thumbnail) setThumbnail(`/api/temp/${suggestion.thumbnail}`);
        if (suggestion.keywords.length) setKeywords(suggestion.keywords);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        if (isAxiosError(err) && err.response?.status === 422) {
          message.warning(getApiErrorMessage(err, 'Suggestion unavailable for this URL'));
        } else if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          message.warning('Suggestion unavailable for this URL');
        }
      }
    } finally {
      if (!controller.signal.aborted) setSuggesting(false);
    }
  };

  const handleFinish = (values: { title: string; url: string; process: boolean }) => {
    const payload: NewLink = {
      ...(isEdit && { id: entry.id }),
      title: values.title,
      url: values.url,
      tags,
      collections,
      process: values.process,
    };
    mutation.mutate(payload, {
      onSuccess: (data) => {
        message.success(isEdit ? 'Link updated' : 'Link created');
        onSuccess?.(data.id);
      },
      onError: (err) => message.error(getApiErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} link`)),
    });
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      layout="vertical"
      initialValues={{ title: entry?.title, url: entry?.url, process: !isEdit }}
      onValuesChange={() => onDirtyChange?.(true)}
    >
      <Form.Item name="url" label="URL" rules={[{ required: true, type: 'url', message: 'Valid URL required' }]}>
        <Input
            autoFocus={!isEdit}
          placeholder="https://example.com"
          suffix={
            !isEdit && (
              <Tooltip title="Auto-fill from URL">
                <BulbOutlined
                  onClick={handleSuggest}
                  style={{ cursor: 'pointer', color: suggesting ? 'var(--ant-color-primary)' : undefined }}
                />
              </Tooltip>
            )
          }
        />
      </Form.Item>

      {thumbnail && (
        <div style={{ marginBottom: 16 }}>
          <img
            src={thumbnail}
            alt="Thumbnail"
            style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, display: 'block', objectFit: 'cover' }}
            onError={() => setThumbnail(null)}
          />
        </div>
      )}

      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input placeholder="Link title" disabled={suggesting} />
      </Form.Item>

      {keywords.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--ant-color-text-secondary)', marginRight: 8 }}>Keywords:</span>
          {keywords.map((kw) => (
              <Tag key={kw} className="lynks-chip" style={{marginBottom: 4}}>{kw}</Tag>
          ))}
        </div>
      )}

      <Form.Item name="process" label={isEdit ? 'Re-process' : 'Auto-process'} valuePropName="checked" style={{ marginBottom: 8 }}>
        <Switch />
      </Form.Item>
      <TagCollectionSelect
        selectedTags={tags}
        selectedCollections={collections}
        onTagsChange={setTags}
        onCollectionsChange={setCollections}
      />
      <Form.Item style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={mutation.isPending} style={{ borderRadius: 'var(--radius-pill)' }}>
            {isEdit ? 'Save' : 'Create Link'}
          </Button>
          {onCancel && <Button onClick={onCancel} style={{ borderRadius: 'var(--radius-pill)' }}>Cancel</Button>}
        </div>
      </Form.Item>
    </Form>
  );
}
