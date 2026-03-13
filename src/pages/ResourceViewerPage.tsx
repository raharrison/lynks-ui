import {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {App, Button, Card, Input, Popconfirm, Result, Skeleton, Tag, Typography} from 'antd';
import PageSkeleton from '@/components/common/PageSkeleton';
import hljs from 'highlight.js/lib/common';
import DOMPurify from 'dompurify';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileOutlined,
} from '@ant-design/icons';
import {deleteResource, getResourceInfo, getResourceUrl, updateResource} from '@/api/resources';
import {formatDateTime, formatFileSize} from '@/utils/format';
import {QK} from '@/utils/queryKeys';
import { getApiErrorMessage } from '@/utils/apiError';
import type {Resource} from '@/types';
import client from '@/api/client';

const imageExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']);
const videoExts = new Set(['mp4', 'webm', 'ogg', 'mov']);
const audioExts = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']);
const htmlExts = new Set(['html', 'htm']);
const textExts = new Set([
  'txt', 'md', 'json', 'xml', 'csv', 'css', 'js', 'ts', 'tsx', 'jsx',
  'py', 'java', 'kt', 'kts', 'rs', 'go', 'rb', 'sh', 'bash', 'zsh', 'fish',
  'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env', 'properties',
  'sql', 'graphql', 'gql', 'proto',
  'c', 'cpp', 'h', 'hpp', 'cs', 'swift', 'scala', 'clj',
  'lua', 'r', 'pl', 'pm', 'php', 'dart', 'zig', 'nim',
  'makefile', 'dockerfile', 'gitignore', 'editorconfig',
  'log', 'diff', 'patch',
]);
const pdfExts = new Set(['pdf']);

type ViewType = 'image' | 'video' | 'audio' | 'html' | 'text' | 'pdf' | 'unsupported';

function getViewType(ext: string): ViewType {
  const lower = ext.toLowerCase();
  if (imageExts.has(lower)) return 'image';
  if (videoExts.has(lower)) return 'video';
  if (audioExts.has(lower)) return 'audio';
  if (htmlExts.has(lower)) return 'html';
  if (textExts.has(lower)) return 'text';
  if (pdfExts.has(lower)) return 'pdf';
  return 'unsupported';
}

function extToLanguage(ext: string): string {
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', rs: 'rust', go: 'go', java: 'java', kt: 'kotlin',
    kts: 'kotlin', cs: 'csharp', cpp: 'cpp', c: 'c', h: 'c', hpp: 'cpp',
    swift: 'swift', scala: 'scala', sh: 'bash', bash: 'bash', zsh: 'bash',
    sql: 'sql', html: 'html', htm: 'html', css: 'css', xml: 'xml',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', md: 'markdown',
    php: 'php', dart: 'dart', lua: 'lua', r: 'r',
  };
  return map[ext.toLowerCase()] || 'plaintext';
}

function TextViewer({ entryId, resource }: { entryId: string; resource: Resource }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // State resets to initial values (loading=true, error=false) on remount via key prop
    const controller = new AbortController();
    client.get(`/entry/${entryId}/resource/${resource.id}`, { responseType: 'text', signal: controller.signal })
      .then((res) => setContent(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)))
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [entryId, resource.id]);

  const lang = extToLanguage(resource.extension);

  useEffect(() => {
    if (content != null && codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [content, lang]);

  if (loading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (error) return <Result status="error" title="Failed to load file content" />;

  return (
    <div style={{ position: 'relative' }}>
      <Tag style={{ position: 'absolute', top: 8, right: 8, zIndex: 1, fontSize: 'var(--font-size-xxs)' }}>
        {lang}
      </Tag>
      <pre style={{
        background: 'var(--bg-code, #f5f5f5)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 10,
        padding: '16px 20px',
        fontSize: 'var(--font-size-sm)',
        lineHeight: 1.6,
        overflow: 'auto',
        maxHeight: '70vh',
        margin: 0,
      }}>
        <code ref={codeRef} className={`language-${lang}`} style={{ whiteSpace: 'pre', wordBreak: 'normal' }}>
          {content}
        </code>
      </pre>
    </div>
  );
}

function HtmlViewer({ entryId, resource }: { entryId: string; resource: Resource }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    client.get(`/entry/${entryId}/resource/${resource.id}`, { responseType: 'text', signal: controller.signal })
      .then((res) => {
        const raw = typeof res.data === 'string' ? res.data : String(res.data);
        setContent(DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } }));
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [entryId, resource.id]);

  if (loading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (error) return <Result status="error" title="Failed to load HTML content" />;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: content || '' }}
      style={{
        border: '1px solid var(--border-secondary)',
        borderRadius: 10,
        padding: '16px 24px',
        overflow: 'auto',
        maxHeight: '70vh',
        background: 'var(--bg-surface)',
      }}
    />
  );
}

function ResourceContent({ entryId, resource }: { entryId: string; resource: Resource }) {
  const url = getResourceUrl(entryId, resource.id);
  const viewType = getViewType(resource.extension);

  switch (viewType) {
    case 'image':
      return (
        <div style={{ textAlign: 'center' }}>
          <img
            src={url}
            alt={resource.name}
            style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 10, objectFit: 'contain' }}
          />
        </div>
      );
    case 'video':
      return (
        <video
          controls
          src={url}
          style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 10, display: 'block', margin: '0 auto' }}
        />
      );
    case 'audio':
      return (
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <audio controls src={url} style={{ width: '100%', maxWidth: 500 }} />
        </div>
      );
    case 'html':
      return <HtmlViewer key={resource.id} entryId={entryId} resource={resource} />;
    case 'text':
      return <TextViewer key={resource.id} entryId={entryId} resource={resource} />;
    case 'pdf':
      return (
        <iframe
          src={url}
          title={resource.name}
          style={{ width: '100%', height: '75vh', border: 'none', borderRadius: 10 }}
        />
      );
    case 'unsupported':
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FileOutlined style={{ fontSize: 64, color: 'var(--text-muted)', marginBottom: 16 }} />
          <Typography.Title level={4} type="secondary">
            Preview not available for .{resource.extension} files
          </Typography.Title>
          <a href={url} download={resource.name}>
            <Button type="primary" icon={<DownloadOutlined />} style={{ marginTop: 8 }}>
              Download File
            </Button>
          </a>
        </div>
      );
  }
}

export default function ResourceViewerPage() {
  // entryId comes from typed routes like /links/:entryId/resource/:resourceId
  const params = useParams<{ entryId: string; resourceId: string }>();
  const entryId = params.entryId;
  const resourceId = params.resourceId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const { data: resource, isLoading, isError } = useQuery({
    queryKey: QK.resource(entryId!, resourceId!),
    queryFn: () => getResourceInfo(entryId!, resourceId!),
    enabled: !!entryId && !!resourceId,
  });

  useEffect(() => {
    if (resource) {
      document.title = `${resource.name} - Lynks`;
    }
  }, [resource]);

  const renameMutation = useMutation({
    mutationFn: (newName: string) => {
      if (!resource) return Promise.reject(new Error('Resource not loaded'));
      const updated = { ...resource, name: newName };
      return updateResource(entryId!, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.resource(entryId!, resourceId!) });
      queryClient.invalidateQueries({ queryKey: QK.resources(entryId!) });
      message.success('Resource renamed');
      setEditing(false);
    },
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to rename resource')),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteResource(entryId!, resourceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.resources(entryId!) });
      message.success('Resource deleted');
      navigate('../..', { relative: 'path' });
    },
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to delete resource')),
  });

  const startRename = () => {
    if (!resource) return;
    setEditName(resource.name);
    setEditing(true);
  };

  const confirmRename = () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === resource?.name) {
      setEditing(false);
      return;
    }
    renameMutation.mutate(trimmed);
  };

  if (isLoading) return <PageSkeleton rows={8} showTitle />;

  if (isError || !resource) {
    return <Result status="404" title="Resource not found" extra={<Button onClick={() => navigate(-1)}>Go Back</Button>} />;
  }

  const url = getResourceUrl(entryId!, resource.id);
  const viewType = getViewType(resource.extension);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('../..', { relative: 'path' })}
          style={{ marginBottom: 12 }}
        >
          Back to entry
        </Button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onPressEnter={confirmRename}
                  onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }}
                  onBlur={() => setEditing(false)}
                  autoFocus
                  size="large"
                  style={{ flex: 1, maxWidth: 500, fontSize: 18, fontWeight: 600 }}
                />
                <Button
                  icon={<CheckOutlined />}
                  type="primary"
                  size="middle"
                  onClick={confirmRename}
                  onMouseDown={(e) => e.preventDefault()}
                  loading={renameMutation.isPending}
                />
                <Button icon={<CloseOutlined />} size="middle" onClick={() => setEditing(false)} />
              </div>
            ) : (
              <Typography.Title level={2} style={{ margin: '0 0 8px 0' }}>
                {resource.name}
              </Typography.Title>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Tag style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>.{resource.extension}</Tag>
              <Tag style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>{resource.type}</Tag>
              <Tag color={viewType === 'unsupported' ? 'default' : 'green'} style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>
                {viewType === 'unsupported' ? 'No preview' : viewType}
              </Tag>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <Button size="middle" icon={<EditOutlined />} onClick={startRename}>Rename</Button>
            <a href={url} download={resource.name}>
              <Button size="middle" icon={<DownloadOutlined />}>Download</Button>
            </a>
            <Popconfirm
              title="Delete this resource?"
              description="This action cannot be undone."
              onConfirm={() => deleteMutation.mutate()}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button size="middle" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        </div>
      </div>

      {/* Details */}
      <Card size="small" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 'var(--font-size-sm)' }}>
          <div>
            <Typography.Text type="secondary">Size</Typography.Text>
            <div>{formatFileSize(resource.size)}</div>
          </div>
          <div>
            <Typography.Text type="secondary">Version</Typography.Text>
            <div>v{resource.version}</div>
          </div>
          <div>
            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{formatDateTime(resource.dateCreated)}</div>
          </div>
          <div>
            <Typography.Text type="secondary">ID</Typography.Text>
            <div style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{resource.id}</div>
          </div>
        </div>
      </Card>

      {/* Content viewer */}
      <ResourceContent entryId={entryId!} resource={resource} />
    </div>
  );
}
