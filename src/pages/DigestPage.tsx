import {useEffect} from 'react';
import {Button, Empty, Result, Tag} from 'antd';
import {Link} from 'react-router-dom';
import {useDigest} from '@/hooks/useDigest';
import {useStarEntry} from '@/hooks/useStarEntry';
import EntryCard from '@/components/entries/EntryCard';
import EntryListSkeleton from '@/components/entries/EntryListSkeleton';
import {formatRelative} from '@/utils/format';
import PageHeader from '@/components/common/PageHeader';

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
            <PageHeader
                title="Weekly Digest"
                meta={
                    <>
                        {links.length > 0 && `(${links.length})`}
                        {unreadCount > 0 && (
                            <Tag className="lynks-chip lynks-chip-accent" style={{margin: 0}}>{unreadCount} unread</Tag>
                        )}
                    </>
                }
            >
                <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 4}}>
                    Generated {formatRelative(digest.dateCreated)} from your unread links
                </div>
            </PageHeader>

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
