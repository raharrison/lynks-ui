import {Button, Card, Tag} from 'antd';
import {ExportOutlined, EyeInvisibleOutlined, EyeOutlined, GlobalOutlined} from '@ant-design/icons';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Link as RouterLink} from 'react-router-dom';
import {markLinkRead, markLinkUnread} from '@/api/entries';
import {getResourceUrl} from '@/api/resources';
import {QK} from '@/utils/queryKeys';
import {getYouTubeId} from '@/utils/youtube';
import type {Link} from '@/types';
import YouTubeEmbed from './YouTubeEmbed';
import SearchableContent from './SearchableContent';

export default function LinkDetail({ entry }: { entry: Link }) {
  const queryClient = useQueryClient();

  const readMutation = useMutation({
    mutationFn: () => entry.read ? markLinkUnread(entry.id) : markLinkRead(entry.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.entry(entry.id) }),
  });

  const isDead = entry.props.attributes.dead === true;
  const youtubeId = getYouTubeId(entry.url);

  return (
    <>
      {/* URL block */}
      <div style={{
        marginBottom: 20,
        padding: '14px 16px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--accent)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 500,
            wordBreak: 'break-all',
            marginBottom: 12,
          }}
        >
          <ExportOutlined style={{ flexShrink: 0 }} />
          {entry.url}
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <RouterLink to={`/links?source=${encodeURIComponent(entry.source)}`}>
              <Tag icon={<GlobalOutlined/>} className="lynks-chip lynks-chip-clickable"
                   style={{margin: 0, fontSize: 'var(--font-size-sm)', padding: '2px 10px'}}>
              {entry.source}
            </Tag>
          </RouterLink>
          <Button
            type={entry.read ? 'default' : 'primary'}
            size="small"
            icon={entry.read ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => readMutation.mutate()}
            loading={readMutation.isPending}
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            {entry.read ? 'Read' : 'Unread'}
          </Button>
            {isDead && <Tag className="lynks-chip lynks-chip-danger" style={{margin: 0}}>Dead Link</Tag>}
        </div>
      </div>

      {entry.thumbnailId && (
        <Card style={{ marginBottom: 16 }}>
          <img
            src={getResourceUrl(entry.id, entry.thumbnailId)}
            alt="Thumbnail"
            style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
          />
        </Card>
      )}

      {youtubeId && <YouTubeEmbed videoId={youtubeId} />}

      <SearchableContent entryId={entry.id} content={entry.content ?? null} />
    </>
  );
}
