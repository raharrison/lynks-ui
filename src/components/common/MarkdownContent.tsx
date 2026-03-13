import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { Link } from 'react-router-dom';
import { Card } from 'antd';

interface MarkdownContentProps {
  html?: string | null;
  plain?: string | null;
  emptyMessage?: string;
}

function MarkdownLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href) {
    let internalPath: string | null = null;
    try {
      const url = new URL(href, window.location.origin);
      if (url.origin === window.location.origin) {
        internalPath = url.pathname + url.search + url.hash;
      }
    } catch {
      // relative path
      internalPath = href;
    }
    if (internalPath !== null) {
      return <Link to={internalPath}>{children}</Link>;
    }
  }
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}

export default function MarkdownContent({ html, plain, emptyMessage = 'No content.' }: MarkdownContentProps) {
  if (!html && !plain) {
    return (
      <Card style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
          {emptyMessage}
        </div>
      </Card>
    );
  }

  if (html) {
    return (
      <Card style={{ marginBottom: 20 }}>
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{ a: MarkdownLink }}
          >
            {html}
          </ReactMarkdown>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <div className="markdown-content" style={{ whiteSpace: 'pre-wrap' }}>{plain}</div>
    </Card>
  );
}
