import {useRef} from 'react';
import {Drawer} from 'antd';

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
}

const DISMISS_DISTANCE = 80;

/** A drawer from the bottom edge that can be swiped down to close, for menus on touch screens. */
export default function BottomSheet({open, onClose, title, children}: BottomSheetProps) {
    const startY = useRef<number | null>(null);
    const sheetRef = useRef<HTMLDivElement | null>(null);

    const sheet = (target: EventTarget) =>
        sheetRef.current ??= (target as HTMLElement).closest<HTMLDivElement>('.ant-drawer-content-wrapper');

    const onTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (startY.current === null) return;
        const dy = Math.max(0, e.touches[0].clientY - startY.current);
        const el = sheet(e.target);
        if (el) {
            el.style.transition = 'none';
            el.style.transform = `translateY(${dy}px)`;
        }
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (startY.current === null) return;
        const dy = e.changedTouches[0].clientY - startY.current;
        startY.current = null;
        const el = sheet(e.target);
        if (el) {
            el.style.transition = '';
            el.style.transform = '';
        }
        if (dy > DISMISS_DISTANCE) onClose();
    };

    return (
        <Drawer
            placement="bottom"
            open={open}
            onClose={onClose}
            size="auto"
            closable={false}
            rootClassName="bottom-sheet"
        >
            <div className="bottom-sheet-grip" onTouchStart={onTouchStart} onTouchMove={onTouchMove}
                 onTouchEnd={onTouchEnd}>
                <span className="bottom-sheet-handle"/>
                {title && <div className="bottom-sheet-title">{title}</div>}
            </div>
            <div className="bottom-sheet-body">{children}</div>
        </Drawer>
    );
}
