// Mirrors the server's ReturnTo, so only same-origin app paths survive a round trip through the login page
export function safeReturnTo(raw: string | null | undefined): string {
    if (!raw || raw.length > 2048 || !raw.startsWith('/')) return '/';
    if (raw.startsWith('//') || raw.startsWith('/\\')) return '/';
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001f\u007f\\]/.test(raw)) return '/';
    let path: string;
    try {
        path = decodeURIComponent(raw.split(/[?#]/)[0]);
    } catch {
        return '/';
    }
    if (path.split('/').some((segment) => segment === '.' || segment === '..')) return '/';
    if (path === '/api' || path.startsWith('/api/') || path === '/login') return '/';
    return raw;
}

/** The login page, remembering where to come back to unless that is the home page. */
export function loginPath(current: string): string {
    const returnTo = safeReturnTo(current);
    return returnTo === '/' ? '/login' : `/login?returnTo=${encodeURIComponent(returnTo)}`;
}
