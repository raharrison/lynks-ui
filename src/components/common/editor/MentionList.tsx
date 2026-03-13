import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { AnySlimEntry } from '@/types';

interface MentionListProps {
  items: AnySlimEntry[];
  command: (item: { id: string; label: string; entryType: string }) => void;
}

export interface MentionListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const MentionList = forwardRef<MentionListHandle, MentionListProps>(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSelected(0); }, [items]);

  const select = (index: number) => {
    const item = items[index];
    if (item) {
      command({ id: item.id, label: 'title' in item ? item.title : item.id, entryType: item.type });
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        setSelected((s) => (s - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelected((s) => (s + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        select(selected);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) return null;

  return (
    <div className="mention-dropdown">
      {items.map((item, i) => (
        <button
          key={item.id}
          className={`mention-item${i === selected ? ' mention-item--selected' : ''}`}
          onClick={() => select(i)}
          onMouseEnter={() => setSelected(i)}
        >
          <span className="mention-item-type">{item.type}</span>
          <span className="mention-item-label">{'title' in item ? item.title : item.id}</span>
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';
export default MentionList;
