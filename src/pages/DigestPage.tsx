import {useEffect} from 'react';
import {Button, Empty, Result, Tag} from 'antd';
import {ReadOutlined} from '@ant-design/icons';
import {Link} from 'react-router-dom';
import {useDigest} from '@/hooks/useDigest';
import {useStarEntry} from '@/hooks/useStarEntry';
import EntryCard from '@/components/entries/EntryCard';
import EntryListSkeleton from '@/components/entries/EntryListSkeleton';
import {formatRelative} from '@/utils/format';

export default function DigestPage() {
    useEffect(() => {
        document.title = 'Digest - Lynks';
    }, []);

    const {digest, isLoading, isError} = useDigest();
    const {toggleStar} = useStarEntry();

    const links = digest?.links ?? [];
    const unreadCount = links.filter((l) => !l.read).length;

    if (isLoading) {
        return <EntryListSkeleton/>;
    }

    if (isError) {
        return <Result status="error" title="Failed to load digest"/>;
    }

    if (!digest) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No digest yet. One is generated each week from your unread links."
                style={{padding: '48px 0'}}
            >
                <Link to="/links"><Button type="primary">Browse links</Button></Link>
            </Empty>
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16, flexWrap: 'wrap', gap: 12,
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{fontSize: 20, fontWeight: 600}}>
            <ReadOutlined style={{marginRight: 8, color: 'var(--accent)'}}/>Weekly Digest
          </span>
                    {links.length > 0 && (
                        <span style={{fontWeight: 400, fontSize: 'var(--font-size-md)', color: 'var(--text-muted)'}}>
              ({links.length})
            </span>
                    )}
                    {unreadCount > 0 && (
                        <Tag className="lynks-chip lynks-chip-accent" style={{margin: 0}}>{unreadCount} unread</Tag>
                    )}
                </div>

                <span style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)'}}>
          generated {formatRelative(digest.dateCreated)}
        </span>
            </div>

            {links.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Every link in this digest has since been deleted."
                    style={{padding: '48px 0'}}
                />
            ) : (
                <div className="entry-list">
                    {links.map((link) => (
                        <EntryCard key={link.id} entry={link} onStar={toggleStar}/>
                    ))}
                </div>
            )}
        </div>
    );
}
