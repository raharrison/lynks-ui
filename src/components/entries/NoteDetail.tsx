import MarkdownContent from '@/components/common/MarkdownContent';
import type {Note} from '@/types';

export default function NoteDetail({ entry }: { entry: Note }) {
  return (
    <MarkdownContent
        html={entry.renderedContent}
        plain={entry.plainContent}
      emptyMessage="This note has no content."
    />
  );
}
