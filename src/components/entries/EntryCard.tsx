import {memo, useMemo, useState} from 'react';
import {Button, Tag, Tooltip} from 'antd';
import {EyeInvisibleOutlined, EyeOutlined, StarFilled, StarOutlined,} from '@ant-design/icons';
import {Link} from 'react-router-dom';
import {ENTRY_TYPE_LABELS} from '@/utils/constants';
import {ENTRY_TYPE_ICONS} from '@/utils/icons';
import {entryDetailPath, entryTypeChipClass, formatRelative, truncate} from '@/utils/format';
import {EntryCollectionChip, EntryTagChip} from '@/components/common/EntryGroupChips';
import type {AnySlimEntry} from '@/types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function getTitle(entry: AnySlimEntry): string {
  if ('title' in entry) return entry.title;
    if ('renderedContent' in entry) return truncate(stripHtml(entry.renderedContent), 80);
  return (entry as { id: string }).id;
}

function getSubtitle(entry: AnySlimEntry): string | null {
  if (entry.type === 'link') return entry.source;
  return null;
}

interface EntryCardProps {
  entry: AnySlimEntry;
  onStar: (id: string, starred: boolean) => void;
}

function EntryCard({entry, onStar}: EntryCardProps) {
  const thumbnailId = entry.type === 'link' ? entry.thumbnailId : null;
  const isRead = entry.type === 'link' ? entry.read : true;
  const title = useMemo(() => getTitle(entry), [entry]);
  const subtitle = getSubtitle(entry);
  const [thumbnailError, setThumbnailError] = useState(false);

  return (
    <Link to={entryDetailPath(entry.type, entry.id)} className="entry-card-link">
      <div className={`entry-card${isRead && entry.type === 'link' ? ' entry-card--read' : ''}`}>
        <div className="entry-card-body">
          {thumbnailId && !thumbnailError && (
            <div className="entry-card-thumbnail">
              <img
                src={`/api/entry/${entry.id}/resource/${thumbnailId}`}
                alt={title}
                onError={() => setThumbnailError(true)}
              />
            </div>
          )}

          <div className="entry-card-content">
            <div className="entry-card-header">
              <div className="entry-card-title-area">
                <div className="entry-card-type-row">
                    <Tag className={entryTypeChipClass(entry.type)}
                         style={{margin: 0, fontSize: 'var(--font-size-xxs)', lineHeight: '20px'}}>
                    {ENTRY_TYPE_ICONS[entry.type]} {ENTRY_TYPE_LABELS[entry.type]}
                  </Tag>
                  {entry.type === 'link' && !isRead && (
                      <Tag className="lynks-chip lynks-chip-accent"
                           style={{margin: 0, fontSize: 'var(--font-size-xxs)', lineHeight: '20px'}}>
                      <EyeInvisibleOutlined /> Unread
                    </Tag>
                  )}
                  {entry.type === 'link' && isRead && (
                    <Tooltip title="Read">
                      <EyeOutlined style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }} />
                    </Tooltip>
                  )}
                </div>

                <p className="entry-card-title">{title}</p>

                {subtitle && <p className="entry-card-subtitle">{subtitle}</p>}
              </div>

              <Button
                type="text"
                size="small"
                icon={entry.starred ? <StarFilled style={{color: 'var(--color-star)'}}/> : <StarOutlined/>}
                onClick={(e) => {
                  e.preventDefault();
                  onStar(entry.id, entry.starred);
                }}
                aria-label={entry.starred ? 'Unstar entry' : 'Star entry'}
              />
            </div>

            <div className="entry-card-footer">
              <span className="entry-card-date">{formatRelative(entry.dateUpdated)}</span>
              {entry.tags.map((t) => <EntryTagChip key={t.id} tag={t} />)}
              {entry.collections.map((c) => <EntryCollectionChip key={c.id} collection={c} />)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(EntryCard);
