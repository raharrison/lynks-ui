import {describe, expect, it} from 'vitest';
import {loginPath, safeReturnTo} from './returnTo';

describe('safeReturnTo', () => {
    it('keeps same-origin app paths', () => {
        for (const path of ['/', '/links', '/notes/abc?version=2', '/settings?tab=security', '/apis', '/%2F%2Fevil.example', '/tags/caf%C3%A9', '/notes/a.b']) {
            expect(safeReturnTo(path), path).toBe(path);
        }
    });

    it('turns anything else into the home page', () => {
        for (const path of [
            null, undefined, '', 'links', 'https://evil.example', '//evil.example', '/\\evil.example',
            '/links\\x', '/links\nx', '/api', '/api/user', '/api?x=1', '/login', '/login?returnTo=/links',
            '/' + 'a'.repeat(3000), '/./api/user', '/%2e/api/user', '/links/../api/user', '/%61pi/user', '/./login',
            '/links/%zz',
        ]) {
            expect(safeReturnTo(path), String(path)).toBe('/');
        }
    });
});

describe('loginPath', () => {
    it('remembers where the visitor was', () => {
        expect(loginPath('/notes/abc?version=2')).toBe('/login?returnTo=%2Fnotes%2Fabc%3Fversion%3D2');
    });

    it('leaves the home page out', () => {
        expect(loginPath('/')).toBe('/login');
        expect(loginPath('/login')).toBe('/login');
    });
});
