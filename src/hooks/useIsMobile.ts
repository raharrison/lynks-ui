import {useSyncExternalStore} from 'react';
import {MOBILE_BREAKPOINT} from '@/utils/constants';

const subscribe = (onChange: () => void) => {
    window.addEventListener('resize', onChange);
    return () => window.removeEventListener('resize', onChange);
};

const getSnapshot = () => window.innerWidth <= MOBILE_BREAKPOINT;

/** Matches the `max-width: 768px` media queries in the stylesheets. */
export function useIsMobile(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot);
}
