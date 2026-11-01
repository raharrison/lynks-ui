import {isNative} from '@/lib/server';

/** Mapped to vibrator effects in HapticsPlugin.java. */
export type HapticKind = 'tick' | 'toggleOn' | 'toggleOff' | 'threshold' | 'confirm' | 'reject';

/** Fire and forget; does nothing in a browser, where vibration would feel cheap rather than native. */
export function haptic(kind: HapticKind): void {
    if (!isNative) return;
    import('@/native/haptics').then(({perform}) => perform(kind)).catch(() => {});
}
