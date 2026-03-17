import {useState} from 'react';
import DOMPurify from 'dompurify';
import {App, Button, Empty, Popconfirm, Spin, Typography} from 'antd';
import {DeleteOutlined, EditOutlined, MessageOutlined, SendOutlined} from '@ant-design/icons';
import {formatRelative} from '@/utils/format';
import {useComments} from '@/hooks/useComments';
import RichEditor from '@/components/common/editor/RichEditor';
import type {Comment} from '@/types';

export default function CommentSection({ entryId }: { entryId: string }) {
  const { message } = App.useApp();
  const { comments, isLoading, addComment, editComment, removeComment, isAdding, isEditing } = useComments(entryId);
  const [newComment, setNewComment] = useState('');
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);

  return (
    <div>
      <div className="section-header" style={{ fontSize: 16 }}>
        <MessageOutlined /> Comments ({comments.length})
      </div>

      {/* Add comment */}
      <div style={{ marginBottom: 24 }}>
        <RichEditor value={newComment} onChange={setNewComment} minHeight={160} />
        <div style={{ marginTop: 10, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => addComment(newComment, {
              onSuccess: () => { setNewComment(''); message.success('Comment added'); },
            })}
            loading={isAdding}
            disabled={!newComment.trim()}
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            Comment
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : comments.length === 0 ? (
        <Empty description="No comments yet" style={{ padding: '24px 0' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comments.map((comment: Comment) => (
            <div key={comment.id} className="comment-item">
              {editing?.id === comment.id ? (
                <div>
                  <RichEditor
                    value={editing.text}
                    onChange={(v) => setEditing((prev) => prev ? { ...prev, text: v } : null)}
                    minHeight={140}
                  />
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <Button size="small" type="primary"
                            onClick={() => editComment({id: editing.id, plainContent: editing.text}, {
                        onSuccess: () => setEditing(null),
                      })}
                      loading={isEditing}
                    >
                      Save
                    </Button>
                    <Button size="small" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                    {comment.renderedContent ? (
                    <div className="markdown-content" style={{ fontSize: 14 }}
                         dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(comment.renderedContent)}}/>
                  ) : (
                    <div className="markdown-content" style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                        {comment.plainContent}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {formatRelative(comment.dateCreated)}
                      {comment.dateUpdated !== comment.dateCreated && ' (edited)'}
                    </Typography.Text>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setEditing({id: comment.id, text: comment.plainContent})}
                      />
                      <Popconfirm
                        title="Delete this comment?"
                        onConfirm={() => removeComment(comment.id, {
                          onSuccess: () => message.success('Comment deleted'),
                        })}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
