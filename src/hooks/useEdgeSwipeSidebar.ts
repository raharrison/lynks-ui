import {useEffect} from 'react';
import {useSidebarStore} from '@/stores/sidebarStore';
import {isNative} from '@/lib/server';
import {haptic} from '@/lib/haptics';
import type {EdgeZone} from '@/native/edgeSwipe';

const ZONE_WIDTH = 24;
// Android takes no more than 200dp of an edge away from its Back gesture.
const ZONE_HEIGHT = 200;
// Where a thumb rests, clear of the tab bar.
const ZONE_BOTTOM = 0.75;

const SLOP = 8;
const SETTLE_DISTANCE = 0.3;
const FLICK_VELOCITY = 0.4;
// A finger held still before lifting is a placement, not a flick.
const FLICK_WINDOW_MS = 80;
const SETTLE_MS = 200;
// Outlasts Ant Design's own drawer motion, which the inline styles hold still until then.
const CLEAR_MS = 450;

const PANEL = '.sidebar-drawer .ant-drawer-content-wrapper';
const MASK = '.sidebar-drawer .ant-drawer-mask';

export function edgeZone(): EdgeZone {
    const bottom = Math.round(window.innerHeight * ZONE_BOTTOM);
    return {top: Math.max(0, bottom - ZONE_HEIGHT), bottom, width: ZONE_WIDTH};
}

interface Drag {
    opening: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    active: boolean;
    /** Past the distance that settles it the other way, which ticks once on the way over. */
    past: boolean;
}

const panel = () => document.querySelector<HTMLElement>(PANEL);
const mask = () => document.querySelector<HTMLElement>(MASK);
const panelWidth = () => panel()?.offsetWidth || 300;

function style(el: HTMLElement | null, transition: string, props: Partial<Record<'transform' | 'opacity', string>>) {
    if (!el) return;
    el.style.transition = transition;
    Object.assign(el.style, props);
}

/** `offset` is 0 when the sidebar is fully out and minus its width when fully in. */
function place(offset: number) {
    style(panel(), 'none', {transform: `translateX(${offset}px)`, opacity: '1'});
    style(mask(), 'none', {opacity: String(1 + offset / panelWidth())});
}

function clear() {
    for (const el of [panel(), mask()]) style(el, '', {transform: '', opacity: ''});
}

/**
 * Drags the mobile sidebar out from a strip of the left edge, and back in from anywhere
 * on it. App only: the strip is claimed from Android's Back gesture, which would
 * otherwise swallow the swipe, and a browser keeps its edges for its own navigation.
 */
export function useEdgeSwipeSidebar(enabled: boolean) {
    const setCollapsed = useSidebarStore((s) => s.setCollapsed);
    const active = enabled && isNative;

    /* Released explicitly when disabled too: the claim is native, so it outlives a page reload. */
    useEffect(() => {
        if (!isNative) return;
        let released = false;
        const native = import('@/native/edgeSwipe');
        const apply = () => void native.then(({setEdgeZone}) => {
            if (!released) void setEdgeZone(active ? edgeZone() : null);
        });
        apply();
        if (active) window.addEventListener('resize', apply);
        return () => {
            released = true;
            window.removeEventListener('resize', apply);
            if (active) void native.then(({setEdgeZone}) => setEdgeZone(null));
        };
    }, [active]);

    useEffect(() => {
        if (!active) return;
        let drag: Drag | null = null;
        let clearTimer: ReturnType<typeof setTimeout> | undefined;

        const onStart = (e: TouchEvent) => {
            if (e.touches.length !== 1 || document.documentElement.dataset.keyboard === 'open') return;
            const {clientX: x, clientY: y} = e.touches[0];
            const open = !useSidebarStore.getState().collapsed;
            if (open) {
                const target = e.target as Node;
                if (!panel()?.contains(target) && !mask()?.contains(target)) return;
            } else {
                const zone = edgeZone();
                if (x > zone.width || y < zone.top || y > zone.bottom) return;
            }
            drag = {opening: !open, startX: x, startY: y, lastX: x, lastTime: e.timeStamp, velocity: 0, active: false, past: false};
        };

        const onMove = (e: TouchEvent) => {
            if (!drag) return;
            const {clientX: x, clientY: y} = e.touches[0];
            const dx = x - drag.startX;
            if (!drag.active) {
                const dy = y - drag.startY;
                if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
                if (Math.abs(dx) <= Math.abs(dy) || (dx > 0) !== drag.opening) {
                    drag = null;
                    return;
                }
                drag.active = true;
                clearTimeout(clearTimer);
                if (drag.opening) setCollapsed(false);
            }
            e.preventDefault();
            const elapsed = e.timeStamp - drag.lastTime;
            if (elapsed > 0) drag.velocity = (x - drag.lastX) / elapsed;
            drag.lastX = x;
            drag.lastTime = e.timeStamp;
            const width = panelWidth();
            const past = (drag.opening ? dx : -dx) > width * SETTLE_DISTANCE;
            if (past && !drag.past) haptic('threshold');
            drag.past = past;
            place(drag.opening ? Math.min(0, dx - width) : Math.min(0, dx));
        };

        const onEnd = (e: TouchEvent) => {
            if (!drag?.active) {
                drag = null;
                return;
            }
            if (e.timeStamp - drag.lastTime > FLICK_WINDOW_MS) drag.velocity = 0;
            const width = panelWidth();
            const travel = drag.lastX - drag.startX;
            const stayOpen = drag.opening
                ? travel > width * SETTLE_DISTANCE || drag.velocity > FLICK_VELOCITY
                : !(-travel > width * SETTLE_DISTANCE || drag.velocity < -FLICK_VELOCITY);
            drag = null;

            const ease = `${SETTLE_MS}ms ease-out`;
            style(panel(), `transform ${ease}`, {transform: stayOpen ? 'translateX(0)' : 'translateX(-100%)'});
            style(mask(), `opacity ${ease}`, {opacity: stayOpen ? '1' : '0'});
            clearTimer = setTimeout(() => {
                if (!stayOpen) setCollapsed(true);
                clearTimer = setTimeout(clear, CLEAR_MS);
            }, SETTLE_MS);
        };

        document.addEventListener('touchstart', onStart, {passive: true});
        document.addEventListener('touchmove', onMove, {passive: false});
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
        return () => {
            clearTimeout(clearTimer);
            clear();
            document.removeEventListener('touchstart', onStart);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('touchcancel', onEnd);
        };
    }, [active, setCollapsed]);
}
