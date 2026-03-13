import {Button, Card, Collapse, Tag} from 'antd';
import {ExportOutlined, EyeInvisibleOutlined, EyeOutlined, GlobalOutlined} from '@ant-design/icons';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {markLinkRead, markLinkUnread} from '@/api/entries';
import {getResourceUrl} from '@/api/resources';
import {QK} from '@/utils/queryKeys';
import type {Link} from '@/types';

export default function LinkDetail({ entry }: { entry: Link }) {
  const queryClient = useQueryClient();
  const readMutation = useMutation({
    mutationFn: () => entry.read ? markLinkUnread(entry.id) : markLinkRead(entry.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.entry(entry.id) }),
  });

  const isDead = entry.props.attributes.dead === true;

  return (
    <>
      {/* Link metadata */}
      <div style={{ marginBottom: 20 }}>
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            color: 'var(--accent)',
            fontSize: 'var(--font-size-md)',
            wordBreak: 'break-all',
            marginBottom: 12,
          }}
        >
          {entry.url} <ExportOutlined style={{ fontSize: 'var(--font-size-xs)' }} />
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Tag icon={<GlobalOutlined />} style={{ margin: 0, fontSize: 'var(--font-size-sm)', padding: '2px 10px' }}>
            {entry.source}
          </Tag>
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
          {isDead && <Tag color="red" style={{ margin: 0 }}>Dead Link</Tag>}
        </div>
      </div>

      {entry.thumbnailId && (
        <Card style={{ marginBottom: 20 }}>
          <img src={getResourceUrl(entry.id, entry.thumbnailId)} alt="Thumbnail"
               style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 10 }} />
        </Card>
      )}

      {entry.content && (
        <Collapse
          style={{ marginBottom: 20 }}
          items={[{
            key: 'content',
            label: 'Extracted Content',
            children: (
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{entry.content}</ReactMarkdown>
              </div>
            ),
          }]}
        />
      )}

    </>
  );
}
