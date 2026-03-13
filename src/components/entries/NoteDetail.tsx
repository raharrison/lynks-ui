import MarkdownContent from '@/components/common/MarkdownContent';
import type { Note } from '@/types';

export default function NoteDetail({ entry }: { entry: Note }) {
  return (
    <MarkdownContent
      html={entry.markdownText}
      plain={entry.plainText}
      emptyMessage="This note has no content."
    />
  );
}
