import {registerPlugin} from '@capacitor/core';

/** CSS pixels from the top of the WebView. */
export interface EdgeZone {
    top: number;
    bottom: number;
    width: number;
}

interface EdgeSwipePlugin {
    setZone(options: {zone: EdgeZone | null}): Promise<void>;
}

const EdgeSwipe = registerPlugin<EdgeSwipePlugin>('EdgeSwipe');

/** Claims `zone` of the left edge from Android's Back gesture, or releases it with null. */
export function setEdgeZone(zone: EdgeZone | null): Promise<void> {
    return EdgeSwipe.setZone({zone});
}
