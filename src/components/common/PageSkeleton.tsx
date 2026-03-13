import { Skeleton } from 'antd';

interface PageSkeletonProps {
  rows?: number;
  showTitle?: boolean;
  showButtons?: boolean;
}

/**
 * Standard page-load skeleton used by detail and edit pages.
 * Renders: progress bar → metadata row → optional title input → optional action buttons → content rows.
 */
export default function PageSkeleton({ rows = 6, showTitle = true, showButtons = false }: PageSkeletonProps) {
  return (
    <div>
      <div className="page-loading" role="status" aria-label="Loading" />
      <Skeleton active paragraph={false} style={{ marginBottom: 12 }} />
      {showTitle && (
        <Skeleton.Input active size="large" style={{ width: 400, marginBottom: 16 }} />
      )}
      {showButtons && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Skeleton.Button active size="small" />
          <Skeleton.Button active size="small" />
        </div>
      )}
      <Skeleton active paragraph={{ rows }} />
    </div>
  );
}
