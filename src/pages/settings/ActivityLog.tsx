import { useState } from 'react';
import { Empty, Pagination, Result, Spin, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getActivityLog } from '@/api/user';
import { QK } from '@/utils/queryKeys';
import { entryTypeColor, formatRelative } from '@/utils/format';

export default function ActivityLog() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: QK.activity(page),
    queryFn: () => getActivityLog({ page, size: 20 }),
  });

  if (isError) return <Result status="error" title="Failed to load activity log" />;
  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', padding: 24 }} />;

  const items = data?.content || [];
  const total = data?.total || 0;

  return (
    <>
      {items.length === 0 ? (
        <Empty description="No activity yet" style={{ padding: '24px 0' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onClick={() => navigate(`/entry/${item.entryId}`)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Typography.Text style={{ fontSize: 'var(--font-size-sm)' }}>{item.details}</Typography.Text>
                  <Tag color={entryTypeColor(item.entryType)} style={{ fontSize: 'var(--font-size-xxs)', margin: 0 }}>{item.entryType}</Tag>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>{item.entryTitle}</Typography.Text>
                  {item.src && <Tag style={{ fontSize: 'var(--font-size-xxs)', margin: 0 }}>{item.src}</Tag>}
                  <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>{formatRelative(item.timestamp)}</Typography.Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {total > 20 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Pagination current={page} total={total} pageSize={20} onChange={setPage} />
        </div>
      )}
    </>
  );
}
