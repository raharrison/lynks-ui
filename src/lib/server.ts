import axios from 'axios';
import {Capacitor} from '@capacitor/core';
import {Preferences} from '@capacitor/preferences';
import {create} from 'zustand';

// Which Lynks instance this client talks to, and as whom. A browser uses its own origin and its session
// cookie; the app asks for a server once and keeps both in Preferences, where MainActivity's ApiProxy
// reads them too, so the keys change together with ApiProxy.java.

const API_PATH = '/api';
const SERVER_KEY = 'lynks.serverUrl';
const TOKEN_KEY = 'lynks.sessionToken';

export const isNative = Capacitor.isNativePlatform();

interface ServerState {
    /** The instance root, without the API path. Always null in a browser. */
    root: string | null;
    /** The bearer token, which a browser never sees: its session is an HttpOnly cookie. */
    token: string | null;
}

const useServerStore = create<ServerState>(() => ({root: null, token: null}));

export const useServerRoot = () => useServerStore((s) => s.root);

export function apiBaseUrl(): string {
    const {root} = useServerStore.getState();
    return isNative && root ? root + API_PATH : API_PATH;
}

export function sessionToken(): string | null {
    return useServerStore.getState().token;
}

/** Awaited before the first render, since storage is async and the first request needs both. */
export async function loadNativeSession(): Promise<void> {
    if (!isNative) return;
    const [server, token] = await Promise.all([Preferences.get({key: SERVER_KEY}), Preferences.get({key: TOKEN_KEY})]);
    useServerStore.setState({root: server.value || null, token: token.value || null});
}

export async function setServerUrl(root: string): Promise<void> {
    await Preferences.set({key: SERVER_KEY, value: root});
    useServerStore.setState({root});
}

/** The token belongs to the old server, so it goes too. */
export async function clearServerUrl(): Promise<void> {
    useServerStore.setState({root: null, token: null});
    await Promise.all([Preferences.remove({key: SERVER_KEY}), Preferences.remove({key: TOKEN_KEY})]);
}

export async function setSessionToken(token: string | null): Promise<void> {
    if (!isNative) return;
    useServerStore.setState({token});
    if (token) await Preferences.set({key: TOKEN_KEY, value: token});
    else await Preferences.remove({key: TOKEN_KEY});
}

/**
 * People type `lynks.example.com`: TLS is assumed, and an `/api` pasted from the docs is swallowed
 * rather than doubled.
 *
 * @throws Error when the result is not a URL at all
 */
export function normaliseServerUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) throw new Error('Enter a server address');

    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    let parsed: URL;
    try {
        parsed = new URL(withScheme);
    } catch {
        throw new Error('That is not a valid address');
    }
    if (!parsed.hostname) throw new Error('That is not a valid address');

    let path = parsed.pathname.replace(/\/+$/, '');
    if (path.endsWith(API_PATH)) path = path.slice(0, -API_PATH.length);
    return `${parsed.protocol}//${parsed.host}${path}`;
}

export type ProbeResult =
    | { ok: true; version: string }
    | { ok: false; reason: 'unreachable' | 'not-lynks' };

/** Lynks, not Lynks, or nothing there, which the setup screen names apart. */
export async function probeServer(root: string): Promise<ProbeResult> {
    try {
        const {data} = await axios.get<{ application?: string; version?: string }>(
            `${root}${API_PATH}/health`, {timeout: 10_000});
        if (data?.application !== 'lynks') return {ok: false, reason: 'not-lynks'};
        return {ok: true, version: data.version ?? 'unknown'};
    } catch (error) {
        // A 5xx is a proxy in front of an instance that is down, not a wrong address
        if (axios.isAxiosError(error) && error.response) {
            return {ok: false, reason: error.response.status >= 500 ? 'unreachable' : 'not-lynks'};
        }
        return {ok: false, reason: 'unreachable'};
    }
}
