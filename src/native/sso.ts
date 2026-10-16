import {App} from '@capacitor/app';
import {Browser} from '@capacitor/browser';
import {Preferences} from '@capacitor/preferences';

// Registered in AndroidManifest.xml; the server sends the browser tab here when it is done
const RETURN_URL = 'net.ryanh.lynks://sso';
// In storage rather than memory, because Android may kill the app while the browser tab is in front
const VERIFIER_KEY = 'lynks.sso.verifier';

export type SsoReturn = { code: string; verifier: string } | { error: string };

/**
 * Opens the provider in a browser tab. The server finishes the sign in and hands back a one-time
 * code, which only redeems with the verifier kept here, so another app claiming the same url scheme
 * gets nothing usable.
 */
export async function startSso(loginUrl: (challenge: string) => string): Promise<void> {
    const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    await Preferences.set({key: VERIFIER_KEY, value: verifier});
    await Browser.open({url: loginUrl(base64Url(new Uint8Array(digest)))});
}

// getLaunchUrl answers the same for the life of the process, so a remount would replay it
const handled = new Set<string>();

/** Also reads the url that launched the app, for when the tab outlived the process. */
export async function listenForSsoReturn(handle: (result: SsoReturn) => void): Promise<() => void> {
    async function consume(url: string) {
        if (!url.startsWith(RETURN_URL) || handled.has(url)) return;
        handled.add(url);
        void Browser.close().catch(() => undefined);

        const params = new URL(url).searchParams;
        const {value: verifier} = await Preferences.get({key: VERIFIER_KEY});
        await Preferences.remove({key: VERIFIER_KEY});
        const code = params.get('code');
        if (code && verifier) handle({code, verifier});
        else handle({error: params.get('error') ?? 'expired'});
    }

    const listener = await App.addListener('appUrlOpen', ({url}) => void consume(url));
    const launch = await App.getLaunchUrl();
    if (launch?.url) void consume(launch.url);
    return () => void listener.remove();
}

function base64Url(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
