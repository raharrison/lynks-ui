import {useState} from 'react';
import {App, Button, Collapse, Input} from 'antd';
import {CheckOutlined, CloseOutlined, EditOutlined, SearchOutlined} from '@ant-design/icons';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {updateLinkContent} from '@/api/entries';
import {getApiErrorMessage} from '@/utils/apiError';
import {QK} from '@/utils/queryKeys';
import rehypeHighlight from "rehype-highlight";

interface Props {
  entryId: string;
  content: string | null;
}

export default function SearchableContent({ entryId, content }: Props) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const mutation = useMutation({
    mutationFn: (text: string) => updateLinkContent(entryId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.entry(entryId) });
      setEditing(false);
      message.success('Content updated');
    },
    onError: (err) => message.error(getApiErrorMessage(err, 'Failed to update content')),
  });

  const startEdit = () => {
    setDraft(content ?? '');
    setEditing(true);
  };

  return (
    <Collapse
      style={{ marginBottom: 16 }}
      items={[{
        key: 'content',
        label: <span><SearchOutlined style={{ marginRight: 8 }} />Searchable Content</span>,
        extra: !editing && (
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => { e.stopPropagation(); startEdit(); }}
          >
            Edit
          </Button>
        ),
        children: editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input.TextArea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoSize={{ minRows: 6, maxRows: 30 }}
              style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}
            />
              <span style={{fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)'}}>
              Some words may be removed or altered when saved - common words and punctuation are stripped to improve search results.
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" size="small" icon={<CheckOutlined />} loading={mutation.isPending} onClick={() => mutation.mutate(draft)}>
                Save
              </Button>
              <Button size="small" icon={<CloseOutlined />} onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="markdown-content">
            {content
                ? <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>{content}</ReactMarkdown>
              : <span style={{ color: 'var(--text-muted)' }}>No content. Click Edit to add some.</span>
            }
          </div>
        ),
      }]}
    />
  );
}
