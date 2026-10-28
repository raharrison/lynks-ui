import {useEffect, useRef} from 'react';
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {Alert, App, Breadcrumb, Button, Popconfirm, Result, Tabs, Tag, Tooltip, Typography} from 'antd';
import PageSkeleton from '@/components/common/PageSkeleton';
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    RollbackOutlined,
    StarFilled,
    StarOutlined,
} from '@ant-design/icons';
import {ENTRY_TYPE_LABELS} from '@/utils/constants';
import {ENTRY_TYPE_ICONS} from '@/utils/icons';
import {
    ENTRY_PATH_PREFIX,
    entryDetailPath,
    entryEditPath,
    entryTypeChipClass,
    formatDateTime,
    formatRelative
} from '@/utils/format';
import {EntryCollectionChip, EntryTagChip} from '@/components/common/EntryGroupChips';
import {useEntry} from '@/hooks/useEntry';
import {useStarEntry} from '@/hooks/useStarEntry';
import {useDeleteEntry} from '@/hooks/useDeleteEntry';
import {useRevertEntry} from '@/hooks/useRevertEntry';
import type {Discussion} from '@/types';
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
import {useIsMobile} from '@/hooks/useIsMobile';


export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state: locationState, key: locationKey } = useLocation();
  const isMobile = useIsMobile();
  const titleRef = useRef<HTMLElement>(null);
  const { message } = App.useApp();

  const versionParam = searchParams.get('version');
  const requestedVersion = versionParam ? Number(versionParam) : null;
  const activeTab = searchParams.get('tab') || 'resources';

  const { entry, isLoading, isFetching, isError } = useEntry(id, requestedVersion);
  const {toggleStar} = useStarEntry();
  const { deleteEntry } = useDeleteEntry();
    const {revert, isReverting} = useRevertEntry();

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

    const title = 'title' in entry ? entry.title : null;

  const handleDelete = () => {
    deleteEntry({ id: entry.id, type: entry.type }, {
      onSuccess: () => {
        message.success('Entry deleted');
        navigate('/');
      },
    });
  };

    const handleRevert = () => {
        if (!requestedVersion) return;
        revert({type: entry.type, id: entry.id, version: requestedVersion}, {
            onSuccess: () => navigate(entryDetailPath(entry.type, entry.id), {replace: true}),
        });
    };

  const handleTabChange = (key: string) => {
    setSearchParams((prev) => {
      prev.set('tab', key);
      return prev;
    }, { replace: true, preventScrollReset: true });
  };

  const listPath = `/${ENTRY_PATH_PREFIX[entry.type]}`;
  // the first page of a visit has nowhere to go back to, so fall back to the list
  const goBack = () => (locationKey === 'default' ? navigate(listPath) : navigate(-1));

  const actions = (
      <div className="entry-detail-actions">
        <Tooltip title={entry.starred ? 'Unstar' : 'Star'}>
          <Button icon={entry.starred ? <StarFilled style={{color: 'var(--color-star)'}}/> : <StarOutlined/>}
                  onClick={() => toggleStar(entry.id, entry.starred)}
                  aria-label={entry.starred ? 'Unstar entry' : 'Star entry'}/>
        </Tooltip>
        <Button icon={<EditOutlined />} onClick={() => navigate(entryEditPath(entry.type, entry.id))}
                aria-label="Edit">
          {!isMobile && 'Edit'}
        </Button>
        <Popconfirm title="Delete this entry?" description="This action cannot be undone."
                    onConfirm={handleDelete} okText="Delete" okButtonProps={{ danger: true }}
                    placement="bottomRight">
          <Tooltip title="Delete">
            <Button danger icon={<DeleteOutlined />} aria-label="Delete entry" />
          </Tooltip>
        </Popconfirm>
      </div>
  );

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
               title={`Viewing version ${requestedVersion}`}
          description={
              <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                  <Button type="link" size="small" style={{padding: 0}}
                          onClick={() => navigate(entryDetailPath(entry.type, id!), {replace: true})}>
                      Return to latest version
                  </Button>
                  <Popconfirm title={`Restore version ${requestedVersion}?`}
                              description="Its content is saved as a new version. Tags and collections stay as they are now."
                              onConfirm={handleRevert} okText="Restore">
                      <Button type="link" size="small" style={{padding: 0}} icon={<RollbackOutlined/>} loading={isReverting}>
                          Restore this version
                      </Button>
                  </Popconfirm>
              </div>
          }
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {isMobile ? (
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} className="entry-back">
            {ENTRY_TYPE_LABELS[entry.type]}s
          </Button>
      ) : (
          <Breadcrumb style={{ marginBottom: 12 }} items={[
            { title: <a onClick={() => navigate(listPath)} style={{ cursor: 'pointer' }}>{ENTRY_TYPE_LABELS[entry.type]}s</a> },
              {title: title ?? ENTRY_TYPE_LABELS[entry.type]},
          ]} />
      )}

      {/* Header panel */}
      <div className="entry-detail-header" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-secondary)',
        borderLeft: entry.starred ? '4px solid var(--color-warning)' : '1px solid var(--border-secondary)',
        borderRadius: 'var(--radius-lg)',
      }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{flex: '1 1 260px', minWidth: 0}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Tag className={entryTypeChipClass(entry.type)} style={{fontSize: 'var(--font-size-xs)', padding: '2px 10px', margin: 0}}>
                {ENTRY_TYPE_ICONS[entry.type]} {ENTRY_TYPE_LABELS[entry.type]}
              </Tag>
              <span className={`version-badge ${requestedVersion ? 'inactive' : 'active'}`}>v{entry.version}</span>
              {isMobile && actions}
            </div>
              {title && <Typography.Title ref={titleRef} level={2} tabIndex={-1}
                                          style={{margin: '0 0 8px 0', outline: 'none'}}>{title}</Typography.Title>}
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

          {!isMobile && actions}
        </div>
      </div>

      {/* Type-specific content */}
      {entry.type === 'link' && <LinkDetail entry={entry} />}
      {entry.type === 'note' && <NoteDetail entry={entry} />}
      {entry.type === 'snippet' && <SnippetDetail entry={entry} />}

      {/* Tabs */}
      <Tabs
        style={{ marginTop: 8 }}
        size={isMobile ? 'middle' : 'large'}
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />

        {/* Comments - below tabs */}
      <div style={{ marginTop: 32 }}>
        <CommentSection entryId={entry.id} />
      </div>
    </div>
  );
}
