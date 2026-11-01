import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook, waitFor} from '@testing-library/react';
import {useSidebarStore} from '@/stores/sidebarStore';
import {edgeZone, useEdgeSwipeSidebar} from './useEdgeSwipeSidebar';

const setEdgeZone = vi.hoisted(() => vi.fn(() => Promise.resolve()));
vi.mock('@/native/edgeSwipe', () => ({setEdgeZone}));
vi.mock('@/lib/server', () => ({isNative: true}));
const haptic = vi.hoisted(() => vi.fn());
vi.mock('@/lib/haptics', () => ({haptic}));

const HEIGHT = 800;
const IN_ZONE_Y = 550;

function touch(type: string, x: number, y: number, target: EventTarget = document.body) {
    const event = new Event(type, {bubbles: true, cancelable: true});
    Object.defineProperty(event, 'touches', {value: type === 'touchend' ? [] : [{clientX: x, clientY: y}]});
    act(() => {
        target.dispatchEvent(event);
    });
    return event;
}

function swipe(xs: number[], y = IN_ZONE_Y, target?: EventTarget) {
    touch('touchstart', xs[0], y, target);
    const moves = xs.slice(1).map((x) => touch('touchmove', x, y, target));
    touch('touchend', xs[xs.length - 1], y, target);
    return moves;
}

const collapsed = () => useSidebarStore.getState().collapsed;

function addDrawer() {
    document.body.innerHTML = `
        <div class="sidebar-drawer">
            <div class="ant-drawer-mask"></div>
            <div class="ant-drawer-content-wrapper"><button>Notes</button></div>
        </div>`;
    return document.querySelector<HTMLElement>('.ant-drawer-content-wrapper')!;
}

describe('useEdgeSwipeSidebar', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'innerHeight', {configurable: true, value: HEIGHT});
        useSidebarStore.setState({collapsed: true});
        setEdgeZone.mockClear();
        haptic.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('places the zone at thumb height, no taller than Android allows', () => {
        expect(edgeZone()).toEqual({top: 400, bottom: 600, width: 24});
    });

    it('claims the zone from Android, and releases it on unmount', async () => {
        const {unmount} = renderHook(() => useEdgeSwipeSidebar(true));
        await waitFor(() => expect(setEdgeZone).toHaveBeenCalledWith(edgeZone()));

        unmount();
        await waitFor(() => expect(setEdgeZone).toHaveBeenLastCalledWith(null));
    });

    it('releases the zone when disabled, since a reload leaves the native claim behind', async () => {
        renderHook(() => useEdgeSwipeSidebar(false));
        await waitFor(() => expect(setEdgeZone).toHaveBeenCalledWith(null));
        expect(setEdgeZone).not.toHaveBeenCalledWith(edgeZone());
    });

    it('opens the sidebar on a swipe from the zone, taking the move from the page', () => {
        vi.useFakeTimers();
        renderHook(() => useEdgeSwipeSidebar(true));

        const moves = swipe([4, 40, 120, 200]);
        expect(collapsed()).toBe(false);
        expect(moves.at(-1)!.defaultPrevented).toBe(true);

        act(() => {
            vi.runAllTimers();
        });
        expect(collapsed()).toBe(false);
    });

    it('drags the panel with the finger', () => {
        renderHook(() => useEdgeSwipeSidebar(true));
        const panel = addDrawer();

        touch('touchstart', 4, IN_ZONE_Y);
        touch('touchmove', 30, IN_ZONE_Y);
        touch('touchmove', 104, IN_ZONE_Y);
        expect(panel.style.transform).toBe('translateX(-200px)');
    });

    it('ticks once as the drag crosses the threshold, and again only after coming back', () => {
        renderHook(() => useEdgeSwipeSidebar(true));
        addDrawer();

        touch('touchstart', 4, IN_ZONE_Y);
        touch('touchmove', 30, IN_ZONE_Y);
        expect(haptic).not.toHaveBeenCalled();
        touch('touchmove', 150, IN_ZONE_Y);
        touch('touchmove', 200, IN_ZONE_Y);
        expect(haptic).toHaveBeenCalledTimes(1);
        expect(haptic).toHaveBeenCalledWith('threshold');
        touch('touchmove', 40, IN_ZONE_Y);
        touch('touchmove', 150, IN_ZONE_Y);
        expect(haptic).toHaveBeenCalledTimes(2);
    });

    it('snaps back when held short of the threshold, however fast it got there', () => {
        vi.useFakeTimers();
        renderHook(() => useEdgeSwipeSidebar(true));

        touch('touchstart', 4, IN_ZONE_Y);
        vi.advanceTimersByTime(16);
        touch('touchmove', 30, IN_ZONE_Y);
        vi.advanceTimersByTime(16);
        touch('touchmove', 60, IN_ZONE_Y);
        expect(collapsed()).toBe(false);

        vi.advanceTimersByTime(500);
        touch('touchend', 60, IN_ZONE_Y);
        act(() => {
            vi.runAllTimers();
        });
        expect(collapsed()).toBe(true);
    });

    it('opens on a flick short of the threshold', () => {
        vi.useFakeTimers();
        renderHook(() => useEdgeSwipeSidebar(true));

        touch('touchstart', 4, IN_ZONE_Y);
        vi.advanceTimersByTime(16);
        touch('touchmove', 30, IN_ZONE_Y);
        vi.advanceTimersByTime(16);
        touch('touchmove', 60, IN_ZONE_Y);
        vi.advanceTimersByTime(16);
        touch('touchend', 60, IN_ZONE_Y);
        act(() => {
            vi.runAllTimers();
        });
        expect(collapsed()).toBe(false);
    });

    it.each([
        ['outside the zone', [60, 100, 200, 300], IN_ZONE_Y],
        ['above the zone', [4, 40, 120, 200], 300],
    ])('ignores a swipe from %s, which stays Back', (_, xs, y) => {
        renderHook(() => useEdgeSwipeSidebar(true));
        swipe(xs, y);
        expect(collapsed()).toBe(true);
    });

    it('leaves a mostly vertical drag to the page', () => {
        renderHook(() => useEdgeSwipeSidebar(true));
        touch('touchstart', 4, IN_ZONE_Y);
        const move = touch('touchmove', 14, IN_ZONE_Y + 40);
        touch('touchend', 14, IN_ZONE_Y + 40);
        expect(collapsed()).toBe(true);
        expect(move.defaultPrevented).toBe(false);
    });

    it('does nothing while the keyboard is up', () => {
        document.documentElement.dataset.keyboard = 'open';
        renderHook(() => useEdgeSwipeSidebar(true));
        swipe([4, 40, 120, 200]);
        expect(collapsed()).toBe(true);
        delete document.documentElement.dataset.keyboard;
    });

    it('does nothing when disabled', () => {
        renderHook(() => useEdgeSwipeSidebar(false));
        swipe([4, 40, 120, 200]);
        expect(collapsed()).toBe(true);
    });

    it('closes the open sidebar on a swipe left across it', () => {
        vi.useFakeTimers();
        useSidebarStore.setState({collapsed: false});
        renderHook(() => useEdgeSwipeSidebar(true));
        const button = addDrawer().querySelector('button')!;

        swipe([250, 220, 150, 60], 300, button);
        act(() => {
            vi.runAllTimers();
        });
        expect(collapsed()).toBe(true);
    });

    it('keeps the sidebar open on a swipe right across it', () => {
        useSidebarStore.setState({collapsed: false});
        renderHook(() => useEdgeSwipeSidebar(true));
        const button = addDrawer().querySelector('button')!;

        swipe([100, 140, 200], 300, button);
        expect(collapsed()).toBe(false);
    });
});
