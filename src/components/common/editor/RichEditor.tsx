import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {type Editor, EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import {Markdown} from 'tiptap-markdown';
import {common, createLowlight} from 'lowlight';
import {App, Button, Input, Popover, Tooltip} from 'antd';
import {
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  LineOutlined,
  LinkOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import client from '@/api/client';
import {resolveEntries, searchEntries} from '@/api/entries';
import {queryClient} from '@/lib/queryClient';
import {entryDetailPath} from '@/utils/format';
import {IMAGE_UPLOAD_PATH, MENTION_RESULTS_SIZE} from '@/utils/constants';
import MentionList, {type MentionListHandle} from './MentionList';
import type {AnySlimEntry} from '@/types';

const lowlight = createLowlight(common);

// Matches @id patterns stored in markdown (same character set as backend EntryLinkInlineParserExtension)
const MENTION_PATTERN = /(?<!\w)@([a-z\d_-]{1,15})(?![\w-])/gi;

// Pre-process stored markdown: replace @id with [@label](@id:type) so tiptap-markdown
// parses them as Link marks, which transformMentionLinks then converts to Mention nodes.
// Uses queryClient.fetchQuery so concurrent calls for the same IDs share one request.
async function resolveMentionsForEditor(markdown: string): Promise<string> {
  if (!markdown) return markdown;
  const matches = [...markdown.matchAll(MENTION_PATTERN)];
  if (!matches.length) return markdown;
  const ids = [...new Set(matches.map(m => m[1]))].sort();
  const entries = await queryClient.fetchQuery({
    queryKey: ['entries', 'resolve', ...ids],
    queryFn: () => resolveEntries(ids),
    staleTime: 60_000,
  });
  if (!entries.length) return markdown;
  const map = new Map(entries.map(e => [e.id, e]));
  return markdown.replace(MENTION_PATTERN, (_, id: string) => {
    const entry = map.get(id);
    if (!entry) return `@${id}`;
    const label = 'title' in entry ? entry.title : id;
    return `[@${label}](@${id}:${entry.type})`;
  });
}

// After setContent with pre-processed markdown, convert Link marks with @id:type hrefs
// into proper Mention inline nodes. Replacements applied in reverse order to keep positions valid.
function transformMentionLinks(editor: Editor) {
  const mentionType = editor.schema.nodes['mention'];
  if (!mentionType) return;
  const replacements: { from: number; to: number; id: string; label: string; entryType: string }[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return;
    const linkMark = node.marks.find(
        m => m.type.name === 'link' && /^@[a-z\d_-]+:[a-z]+$/i.test(m.attrs['href'] as string)
    );
    if (!linkMark) return;
    const [id, entryType] = (linkMark.attrs['href'] as string).slice(1).split(':');
    const label = (node.text ?? '').replace(/^@/, '');
    replacements.push({from: pos, to: pos + node.nodeSize, id, label, entryType});
  });
  if (!replacements.length) return;
  let tr = editor.state.tr;
  for (const r of [...replacements].reverse()) {
    tr = tr.replaceWith(r.from, r.to, mentionType.create({id: r.id, label: r.label, entryType: r.entryType}));
  }
  editor.view.dispatch(tr);
}

// Extend Mention to carry entryType alongside id/label
const MentionWithType = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      entryType: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-entry-type'),
        renderHTML: (attrs) => ({ 'data-entry-type': attrs.entryType }),
      },
    };
  },
  addStorage() {
    return {
      markdown: {
        // Serialize as bare @id — title is resolved server-side at render time
        serialize(state: { write: (s: string) => void }, node: { attrs: { id: string } }) {
          state.write(`@${node.attrs.id}`);
        },
      },
    };
  },
});

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post(IMAGE_UPLOAD_PATH, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return (data as { data: { filePath: string } }).data.filePath;
}

function ToolbarBtn({ title, active, onClick, disabled, children }: {
  title: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <Tooltip title={title} mouseEnterDelay={0.6}>
      <Button
        type={active ? 'primary' : 'text'}
        size="small"
        disabled={disabled}
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={title}
        style={{ borderRadius: 4, minWidth: 28 }}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleLinkButtonClick = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    setLinkUrl(editor.getAttributes('link').href ?? '');
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkOpen(false);
    setLinkUrl('');
  };

  const cancelLink = () => {
    setLinkOpen(false);
    setLinkUrl('');
    editor.chain().focus().run();
  };

  return (
    <div className="rich-editor-toolbar">
      <ToolbarBtn title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><UndoOutlined /></ToolbarBtn>
      <ToolbarBtn title="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><RedoOutlined /></ToolbarBtn>
      <span className="toolbar-sep" />
      <ToolbarBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><BoldOutlined /></ToolbarBtn>
      <ToolbarBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><ItalicOutlined /></ToolbarBtn>
      <ToolbarBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><StrikethroughOutlined /></ToolbarBtn>
      <ToolbarBtn title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><CodeOutlined /></ToolbarBtn>
      <Popover
        open={linkOpen}
        onOpenChange={(open) => { if (!open) cancelLink(); }}
        trigger="click"
        content={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              autoFocus
              size="small"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onPressEnter={applyLink}
              onKeyDown={(e) => { if (e.key === 'Escape') cancelLink(); }}
              style={{ width: 260 }}
            />
            <Button size="small" type="primary" onClick={applyLink}>Apply</Button>
          </div>
        }
      >
        <span onMouseDown={(e) => e.preventDefault()}>
          <ToolbarBtn title="Link" active={editor.isActive('link')} onClick={handleLinkButtonClick}><LinkOutlined /></ToolbarBtn>
        </span>
      </Popover>
      <span className="toolbar-sep" />
      {([1, 2, 3] as const).map((lvl) => (
        <ToolbarBtn key={lvl} title={`Heading ${lvl}`} active={editor.isActive('heading', { level: lvl })} onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()}>
          <span style={{ fontSize: 'var(--font-size-xxs)', fontWeight: 700 }}>H{lvl}</span>
        </ToolbarBtn>
      ))}
      <span className="toolbar-sep" />
      <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><UnorderedListOutlined /></ToolbarBtn>
      <ToolbarBtn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><OrderedListOutlined /></ToolbarBtn>
      <span className="toolbar-sep" />
      <ToolbarBtn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <span style={{ fontSize: 'var(--font-size-xxs)', fontFamily: 'monospace', fontWeight: 700 }}>{'<>'}</span>
      </ToolbarBtn>
      <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>"</span>
      </ToolbarBtn>
      <ToolbarBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><LineOutlined /></ToolbarBtn>
    </div>
  );
}

interface MentionState {
  items: AnySlimEntry[];
  command: (item: { id: string; label: string; entryType: string }) => void;
  position: { top: number; left: number };
}

export default function RichEditor({ value, onChange, minHeight = 200 }: {
  value: string; onChange: (md: string) => void; minHeight?: number;
}) {
  const { message } = App.useApp();
  const messageRef = useRef(message);
  useEffect(() => { messageRef.current = message; }, [message]);
  // null = not yet initialised; forces the first load to go through resolution
  const lastValue = useRef<string | null>(null);
  const skipOnUpdate = useRef(false);
  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const mentionListRef = useRef<MentionListHandle>(null);
  // Stable ref so suggestion callbacks always call the latest setter.
  // setMentionState is a stable dispatch function from useState, so the ref never needs updating.
  const setMentionRef = useRef(setMentionState);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false }),
      CodeBlockLowlight.configure({ lowlight }),
      ImageExt.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Markdown.configure({ html: false, transformCopiedText: true, transformPastedText: true }),
      MentionWithType.configure({
        HTMLAttributes: { class: 'mention-node' },
        renderHTML({ node }) {
          return ['a', { href: entryDetailPath(node.attrs.entryType, node.attrs.id), class: 'mention-node' }, `@${node.attrs.label}`];
        },
        suggestion: {
          items: async ({ query }) => {
            if (!query) return [];
            const res = await searchEntries(query, { page: 1, size: MENTION_RESULTS_SIZE, sort: 'dateUpdated', direction: 'desc' });
            return res.content;
          },
          render: () => {
            return {
              onStart(props) {
                const rect = props.clientRect?.();
                if (!rect) return;
                setMentionRef.current({
                  items: props.items as AnySlimEntry[],
                  command: props.command,
                  position: { top: rect.bottom + 4, left: rect.left },
                });
              },
              onUpdate(props) {
                const rect = props.clientRect?.();
                setMentionRef.current((prev) => prev ? {
                  ...prev,
                  items: props.items as AnySlimEntry[],
                  command: props.command,
                  ...(rect ? { position: { top: rect.bottom + 4, left: rect.left } } : {}),
                } : null);
              },
              onKeyDown: ({ event }) => mentionListRef.current?.onKeyDown(event) ?? false,
              onExit() { setMentionRef.current(null); },
            };
          },
        },
      }),
    ],
    content: '',
    editorProps: {
      handlePaste: (_view, event) => {
        for (const item of event.clipboardData?.items ?? []) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              const key = 'img-upload';
              messageRef.current.loading({ content: 'Uploading image…', key });
              uploadImage(file)
                .then((url) => {
                  editor?.chain().focus().setImage({ src: url }).run();
                  messageRef.current.success({ content: 'Image uploaded', key, duration: 2 });
                })
                .catch(() => messageRef.current.error({ content: 'Image upload failed', key, duration: 3 }));
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const key = 'img-upload';
            messageRef.current.loading({ content: 'Uploading image…', key });
            uploadImage(file)
              .then((url) => {
                editor?.chain().focus().setImage({ src: url }).run();
                messageRef.current.success({ content: 'Image uploaded', key, duration: 2 });
              })
              .catch(() => messageRef.current.error({ content: 'Image upload failed', key, duration: 3 }));
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      if (skipOnUpdate.current) return;
      const md = (e.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
      lastValue.current = md;
      onChange(md);
    },
  });

  // Load content into the editor, resolving any @id mentions to proper Mention nodes.
  // lastValue starts as null so the first run always fires (even when value is '').
  // resolveMentionsForEditor uses queryClient.fetchQuery, so StrictMode double-mount
  // hits the cache on the second call rather than firing a second network request.
  useEffect(() => {
    if (!editor || value === lastValue.current) return;
    void resolveMentionsForEditor(value).then((resolved) => {
      if (!editor) return;
      skipOnUpdate.current = true;
      editor.commands.setContent(resolved, false as unknown as Parameters<typeof editor.commands.setContent>[1]);
      transformMentionLinks(editor);
      skipOnUpdate.current = false;
      const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
      lastValue.current = md;
    });
  }, [value, editor]);

  return (
    <div className="rich-editor" style={{ '--editor-min-height': `${minHeight}px` } as React.CSSProperties}>
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
      {mentionState && createPortal(
        <div style={{ position: 'fixed', top: mentionState.position.top, left: mentionState.position.left, zIndex: 'var(--z-dropdown)' }}>
          <MentionList ref={mentionListRef} items={mentionState.items} command={mentionState.command} />
        </div>,
        document.body
      )}
    </div>
  );
}
