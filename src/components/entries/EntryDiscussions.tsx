import {Empty, Tag, Typography} from 'antd';
import {ExportOutlined, LinkOutlined, RedditOutlined} from '@ant-design/icons';
import {formatRelative} from '@/utils/format';
import {REDDIT_BASE_URL} from '@/utils/constants';
import type {Discussion} from '@/types';

interface SourceConfig {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const SOURCE_CONFIG: Record<string, SourceConfig> = {
  reddit: { label: 'Reddit', color: 'orange', icon: <RedditOutlined /> },
  hacker_news: { label: 'Hacker News', color: 'volcano', icon: <LinkOutlined /> },
};

function getSourceConfig(source: string): SourceConfig {
  return SOURCE_CONFIG[source.toLowerCase()] ?? {
    label: source.charAt(0).toUpperCase() + source.slice(1).toLowerCase().replace(/_/g, ' '),
    color: 'default',
    icon: <LinkOutlined />,
  };
}

function resolveUrl(source: string, url: string): string {
  const s = source.toLowerCase();
  if (s === 'reddit') {
    return `${REDDIT_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url.startsWith('http') ? url : `https://${url}`;
}

export default function EntryDiscussions({ discussions }: { discussions: Discussion[] }) {
  if (!discussions.length) {
    return <Empty description="No discussions found yet" style={{ padding: '40px 0' }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {discussions.map((d) => {
        const config = getSourceConfig(d.source);
        return (
          <a
            key={`${d.source}-${d.url}`}
            href={resolveUrl(d.source, d.url)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-surface)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-secondary)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Tag
                  color={config.color}
                  icon={config.icon}
                  style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}
                >
                  {config.label}
                </Tag>
                <Typography.Text strong style={{ fontSize: 14, flex: 1 }}>{d.title}</Typography.Text>
                <ExportOutlined style={{ fontSize: 'var(--font-size-xxs)', color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>{d.score} points</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>{d.comments} comments</Typography.Text>
                {d.created && (
                  <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>{formatRelative(d.created)}</Typography.Text>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
