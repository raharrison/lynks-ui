import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {isNative} from '@/lib/server';

// Ant Design closes the topmost of these on a window Escape, and keeps a closed one mounted but hidden
const OVERLAYS = '.ant-modal-wrap, .ant-drawer-content-wrapper, .ant-image-preview';

function overlayOpen(): boolean {
    return Array.from(document.querySelectorAll(OVERLAYS)).some((element) => element.getClientRects().length > 0);
}

/**
 * Android's back gesture: an open overlay, then history, then minimise. Mounted once, since a second
 * `backButton` listener would fire alongside this one rather than instead of it.
 */
export function useAndroidBack() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isNative) return;

        let detached = false;
        let remove: (() => void) | null = null;

        void import('@capacitor/app').then(async ({App}) => {
            const listener = await App.addListener('backButton', ({canGoBack}) => {
                if (overlayOpen()) {
                    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
                } else if (canGoBack && window.history.length > 1) {
                    navigate(-1);
                } else {
                    void App.minimizeApp();
                }
            });
            if (detached) void listener.remove();
            else remove = () => void listener.remove();
        });

        return () => {
            detached = true;
            remove?.();
        };
    }, [navigate]);
}
