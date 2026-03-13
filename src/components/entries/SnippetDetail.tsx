import MarkdownContent from '@/components/common/MarkdownContent';
import type { Snippet } from '@/types';

export default function SnippetDetail({ entry }: { entry: Snippet }) {
  return (
    <MarkdownContent
      html={entry.markdownText}
      plain={entry.plainText}
      emptyMessage="This snippet has no content."
    />
  );
}
