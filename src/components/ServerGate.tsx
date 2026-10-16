import type {ReactNode} from 'react';
import {isNative, useServerRoot} from '@/lib/server';
import ServerSetupPage from '@/pages/ServerSetupPage';

/** Holds back anything that would issue a request until the app has a server. */
export default function ServerGate({children}: { children: ReactNode }) {
    const root = useServerRoot();
    if (isNative && !root) return <ServerSetupPage/>;
    return <>{children}</>;
}
