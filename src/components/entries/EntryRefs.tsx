import {Empty, Spin, Tag, Typography} from 'antd';
import {ArrowLeftOutlined, ExportOutlined} from '@ant-design/icons';
import {Link} from 'react-router-dom';
import {entryDetailPath, entryTypeColor} from '@/utils/format';
import {useEntryRefs} from '@/hooks/useEntryRefs';

export default function EntryRefs({ entryId }: { entryId: string }) {
  const { refs, isLoading } = useEntryRefs(entryId);

  if (isLoading) return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;

  if (!refs || (!refs.inbound.length && !refs.outbound.length)) {
    return <Empty description="No references found" style={{padding: '24px 0'}}/>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {refs.outbound.length > 0 && (
        <div>
          <div className="section-header"><ExportOutlined /> Links to ({refs.outbound.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {refs.outbound.map((r) => (
              <Link key={r.entryId} to={entryDetailPath(r.entryType, r.entryId)} className="ref-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Tag color={entryTypeColor(r.entryType)} style={{ margin: 0, fontSize: 'var(--font-size-xxs)' }}>{r.entryType}</Tag>
                <Typography.Text style={{ fontSize: 'var(--font-size-sm)' }}>{r.title || r.entryId}</Typography.Text>
              </Link>
            ))}
          </div>
        </div>
      )}
      {refs.inbound.length > 0 && (
        <div>
          <div className="section-header"><ArrowLeftOutlined /> Linked from ({refs.inbound.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {refs.inbound.map((r) => (
              <Link key={r.entryId} to={entryDetailPath(r.entryType, r.entryId)} className="ref-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Tag color={entryTypeColor(r.entryType)} style={{ margin: 0, fontSize: 'var(--font-size-xxs)' }}>{r.entryType}</Tag>
                <Typography.Text style={{ fontSize: 'var(--font-size-sm)' }}>{r.title || r.entryId}</Typography.Text>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
