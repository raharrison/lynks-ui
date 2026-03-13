import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, App, Breadcrumb, Button, Popconfirm, Result, Tabs, Tag, Tooltip, Typography } from 'antd';
import PageSkeleton from '@/components/common/PageSkeleton';
import {
  DeleteOutlined,
  EditOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { ENTRY_TYPE_COLORS, ENTRY_TYPE_LABELS } from '@/utils/constants';
import { ENTRY_TYPE_ICONS } from '@/utils/icons';
import { ENTRY_PATH_PREFIX, entryDetailPath, entryEditPath, formatDateTime, formatRelative } from '@/utils/format';
import { EntryCollectionChip, EntryTagChip } from '@/components/common/EntryGroupChips';
import { useEntry } from '@/hooks/useEntry';
import { useStarEntry } from '@/hooks/useStarEntry';
import { useDeleteEntry } from '@/hooks/useDeleteEntry';
import { getApiErrorMessage } from '@/utils/apiError';
import type { Discussion } from '@/types';
import LinkDetail from '@/components/entries/LinkDetail';
import NoteDetail from '@/components/entries/NoteDetail';
import SnippetDetail from '@/components/entries/SnippetDetail';
import EntryResources from '@/components/entries/EntryResources';
import EntryRefs from '@/components/entries/EntryRefs';
import EntryTasks from '@/components/entries/EntryTasks';
import EntryHistory from '@/components/entries/EntryHistory';
import EntryDiscussions from '@/components/entries/EntryDiscussions';
import ReminderSection from '@/components/reminders/ReminderSection';
import CommentSection from '@/components/comments/CommentSection';


export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const titleRef = useRef<HTMLElement>(null);
  const { message } = App.useApp();

  const versionParam = searchParams.get('version');
  const requestedVersion = versionParam ? Number(versionParam) : null;
  const activeTab = searchParams.get('tab') || 'resources';

  const { entry, isLoading, isFetching, isError } = useEntry(id, requestedVersion);
  const { toggleStar } = useStarEntry(id || '');
  const { deleteEntry } = useDeleteEntry();

  useEffect(() => {
    const title = entry && 'title' in entry ? entry.title : null;
    if (title) document.title = `${title} - Lynks`;
  }, [entry]);

  useEffect(() => {
    if (locationState?.savedEntry && !isLoading && entry && titleRef.current) {
      titleRef.current.focus();
    }
  }, [locationState?.savedEntry, isLoading, entry]);

  if (isLoading) return <PageSkeleton rows={6} showTitle showButtons />;
  if (isError || !entry) return <Result status="404" title="Entry not found" extra={<Button onClick={() => navigate('/')}>Back</Button>} />;

  const title = 'title' in entry ? entry.title : `${entry.type} ${entry.id}`;

  const handleDelete = () => {
    deleteEntry({ id: entry.id, type: entry.type }, {
      onSuccess: () => {
        message.success('Entry deleted');
        navigate('/');
      },
      onError: (err: Error) => message.error(getApiErrorMessage(err, 'Failed to delete entry')),
    });
  };

  const handleTabChange = (key: string) => {
    setSearchParams((prev) => {
      prev.set('tab', key);
      return prev;
    }, { replace: true });
  };

  const discussions: Discussion[] = entry.type === 'link'
    ? (entry.props.attributes.discussions ?? [])
    : [];

  const tabItems = [
    { key: 'resources', label: 'Resources', children: <EntryResources entryId={entry.id} entryType={entry.type} /> },
    { key: 'reminders', label: 'Reminders', children: <ReminderSection entryId={entry.id} /> },
    ...(entry.props.tasks.length > 0
      ? [{ key: 'tasks', label: 'Tasks', children: <EntryTasks entryId={entry.id} tasks={entry.props.tasks} /> }]
      : []),
    ...(entry.type === 'link'
      ? [{ key: 'discussions', label: `Discussions${discussions.length > 0 ? ` (${discussions.length})` : ''}`, children: <EntryDiscussions discussions={discussions} /> }]
      : []),
    { key: 'refs', label: 'References', children: <EntryRefs entryId={entry.id} /> },
    { key: 'history', label: 'History', children: <EntryHistory entryId={entry.id} entryType={entry.type} currentVersion={requestedVersion || entry.version} /> },
  ];

  return (
    <div>
      {isFetching && !isLoading && <div className="page-loading" role="status" aria-label="Loading" />}

      {/* Version banner */}
      {requestedVersion && (
        <Alert type="info" showIcon
          message={`Viewing version ${requestedVersion} of ${entry.version}`}
          description={
            <Button type="link" size="small" style={{ padding: 0 }}
                    onClick={() => navigate(entryDetailPath(entry.type, id!), { replace: true })}>
              Return to latest version
            </Button>
          }
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Breadcrumb style={{ marginBottom: 12 }} items={[
          { title: <a onClick={() => navigate(`/${ENTRY_PATH_PREFIX[entry.type]}`)} style={{ cursor: 'pointer' }}>{ENTRY_TYPE_LABELS[entry.type]}s</a> },
          { title: title },
        ]} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Tag color={ENTRY_TYPE_COLORS[entry.type]} style={{ fontSize: 'var(--font-size-xs)', padding: '2px 10px' }}>
                {ENTRY_TYPE_ICONS[entry.type]} {ENTRY_TYPE_LABELS[entry.type]}
              </Tag>
              <span className={`version-badge ${requestedVersion ? 'inactive' : 'active'}`}>v{entry.version}</span>
            </div>
            <Typography.Title ref={titleRef} level={2} tabIndex={-1} style={{ margin: '0 0 8px 0', outline: 'none' }}>{title}</Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
              Created {formatDateTime(entry.dateCreated)} &middot; Updated {formatRelative(entry.dateUpdated)}
            </Typography.Text>
            {(entry.tags.length > 0 || entry.collections.length > 0) && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {entry.tags.map((t) => <EntryTagChip key={t.id} tag={t} />)}
                {entry.collections.map((c) => <EntryCollectionChip key={c.id} collection={c} />)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <Tooltip title={entry.starred ? 'Unstar' : 'Star'}>
              <Button size="middle" icon={entry.starred ? <StarFilled style={{ color: 'var(--color-warning)' }} /> : <StarOutlined />}
                      onClick={() => toggleStar(entry.starred)} aria-label={entry.starred ? 'Unstar entry' : 'Star entry'} />
            </Tooltip>
            <Button size="middle" icon={<EditOutlined />} onClick={() => navigate(entryEditPath(entry.type, entry.id))}>Edit</Button>
            <Popconfirm title="Delete this entry?" description="This action cannot be undone."
                        onConfirm={handleDelete} okText="Delete" okButtonProps={{ danger: true }}>
              <Tooltip title="Delete">
                <Button size="middle" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border-secondary)', margin: '0 0 24px 0' }} />

      {/* Type-specific content */}
      {entry.type === 'link' && <LinkDetail entry={entry} />}
      {entry.type === 'note' && <NoteDetail entry={entry} />}
      {entry.type === 'snippet' && <SnippetDetail entry={entry} />}

      {/* Tabs */}
      <Tabs
        style={{ marginTop: 8 }}
        size="large"
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />

      {/* Comments — below tabs */}
      <div style={{ marginTop: 32 }}>
        <div style={{ height: 1, background: 'var(--border-secondary)', marginBottom: 24 }} />
        <Typography.Title level={5} style={{ marginBottom: 16 }}>Comments</Typography.Title>
        <CommentSection entryId={entry.id} />
      </div>
    </div>
  );
}
