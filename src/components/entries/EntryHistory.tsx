import {Empty, Spin, Tag, Typography} from 'antd';
import {CheckCircleOutlined, ClockCircleOutlined, HistoryOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {entryDetailPath, formatDateTime, formatRelative} from '@/utils/format';
import {useEntryHistory} from '@/hooks/useEntryHistory';
import type {EntryAuditItem, EntryVersion} from '@/types';

interface EntryHistoryProps {
  entryId: string;
  entryType: string;
  currentVersion: number;
}

export default function EntryHistory({ entryId, entryType, currentVersion }: EntryHistoryProps) {
  const navigate = useNavigate();
  const { versions, audit, isLoading } = useEntryHistory(entryId);

  const latestVersion = currentVersion;

  const handleVersionClick = (version: number) => {
    const base = entryDetailPath(entryType, entryId);
    if (version === latestVersion) {
      navigate(base, { replace: true });
    } else {
      navigate(`${base}?version=${version}`, { replace: true });
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {versions.length > 0 && (
        <div>
          <div className="section-header">
            <HistoryOutlined /> Version History
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {versions.map((v: EntryVersion) => {
              const isActive = v.version === currentVersion;
              const isLatest = v.version === latestVersion;
              return (
                <div
                  key={v.version}
                  onClick={() => handleVersionClick(v.version)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-secondary)'}`,
                    background: isActive ? 'var(--accent-light)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isActive ? (
                    <CheckCircleOutlined style={{ color: 'var(--accent)', fontSize: 16 }} />
                  ) : (
                    <ClockCircleOutlined style={{ color: 'var(--text-muted)', fontSize: 16 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`version-badge ${isActive ? 'active' : 'inactive'}`}>
                        v{v.version}
                      </span>
                        {isLatest &&
                            <Tag className="lynks-chip" style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>Latest</Tag>}
                        {isActive && <Tag className="lynks-chip lynks-chip-accent"
                                          style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>Viewing</Tag>}
                    </div>
                    <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)', marginTop: 2, display: 'block' }}>
                      {formatDateTime(v.dateUpdated)} ({formatRelative(v.dateUpdated)})
                    </Typography.Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {audit.length > 0 && (
        <div>
          <div className="section-header">
            <ClockCircleOutlined /> Audit Log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {audit.map((a: EntryAuditItem) => (
              <div
                key={a.auditId}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-secondary)',
                  background: 'var(--bg-surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Typography.Text style={{ fontSize: 'var(--font-size-sm)' }}>{a.details}</Typography.Text>
                    {a.src && <Tag className="lynks-chip" style={{fontSize: 'var(--font-size-xxs)', margin: 0}}>{a.src}</Tag>}
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {formatDateTime(a.timestamp)} ({formatRelative(a.timestamp)})
                </Typography.Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {versions.length === 0 && audit.length === 0 && (
          <Empty description="No history available" style={{padding: '24px 0'}}/>
      )}
    </div>
  );
}
