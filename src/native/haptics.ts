import {registerPlugin} from '@capacitor/core';
import type {HapticKind} from '@/lib/haptics';

interface HapticsPlugin {
    perform(options: {kind: HapticKind}): Promise<void>;
}

const Haptics = registerPlugin<HapticsPlugin>('Haptics');

export function perform(kind: HapticKind): Promise<void> {
    return Haptics.perform({kind});
}
