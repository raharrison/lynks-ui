import {Skeleton} from 'antd';

interface EntryListSkeletonProps {
    count?: number;
}

/** Placeholder matching the shape of an .entry-list of EntryCards. */
export default function EntryListSkeleton({count = 5}: EntryListSkeletonProps) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            {Array.from({length: count}, (_, i) => (
                <div key={i} style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-secondary)',
                    background: 'var(--bg-surface)',
                }}>
                    <Skeleton active avatar={{shape: 'square', size: 68}} paragraph={{rows: 1}}/>
                </div>
            ))}
        </div>
    );
}
