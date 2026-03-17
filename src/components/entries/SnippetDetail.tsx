import MarkdownContent from '@/components/common/MarkdownContent';
import type {Snippet} from '@/types';

export default function SnippetDetail({ entry }: { entry: Snippet }) {
  return (
    <MarkdownContent
        html={entry.renderedContent}
        plain={entry.plainContent}
      emptyMessage="This snippet has no content."
    />
  );
}
