import {beforeEach, describe, expect, it} from 'vitest';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {page, user} from '@/test/fixtures';
import {useAuthStore} from '@/stores/authStore';
import {checkCurrentUser, getActivityLog, login, revokeOtherSessions, revokeSession, ssoLoginUrl,} from './user';

describe('login', () => {
    beforeEach(() => {
        useAuthStore.setState({user: null});
    });

    it('returns the result on success', async () => {
        server.use(http.post('/api/login', () => HttpResponse.json({result: 'success'})));
        await expect(login({username: 'a', password: 'b'})).resolves.toEqual({result: 'success'});
    });

    it('returns the body of a 401 so the caller can ask for a TOTP code', async () => {
        server.use(http.post('/api/login', () => HttpResponse.json({result: 'totp_required'}, {status: 401})));
        await expect(login({username: 'a', password: 'b'})).resolves.toEqual({result: 'totp_required'});
    });

    it('returns invalid credentials rather than throwing', async () => {
        server.use(http.post('/api/login', () => HttpResponse.json({result: 'invalid_credentials'}, {status: 401})));
        await expect(login({username: 'a', password: 'b'})).resolves.toEqual({result: 'invalid_credentials'});
    });

    it('sends the totp code along with the credentials', async () => {
        let body: unknown;
        server.use(http.post('/api/login', async ({request}) => {
            body = await request.json();
            return HttpResponse.json({result: 'success'});
        }));

        await login({username: 'a', password: 'b', totp: '123456'});

        expect(body).toEqual({username: 'a', password: 'b', totp: '123456'});
    });

    it('throws a 401 without a result', async () => {
        server.use(http.post('/api/login', () => new HttpResponse(null, {status: 401})));
        await expect(login({username: 'a', password: 'b'})).rejects.toMatchObject({response: {status: 401}});
    });

    it('throws server errors', async () => {
        server.use(http.post('/api/login', () => new HttpResponse(null, {status: 500})));
        await expect(login({username: 'a', password: 'b'})).rejects.toMatchObject({response: {status: 500}});
    });
});

describe('checkCurrentUser', () => {
    it('returns the user', async () => {
        server.use(http.get('/api/user', () => HttpResponse.json(user())));
        await expect(checkCurrentUser()).resolves.toEqual(user());
    });

    it('returns null instead of redirecting when signed out', async () => {
        useAuthStore.setState({user: user()});
        server.use(http.get('/api/user', () => new HttpResponse(null, {status: 401})));

        await expect(checkCurrentUser()).resolves.toBeNull();
        expect(useAuthStore.getState().user).not.toBeNull();
    });
});

describe('getActivityLog', () => {
    it('sends only the paging params', async () => {
        let search = '';
        server.use(http.get('/api/user/activity', ({request}) => {
            search = new URL(request.url).search;
            return HttpResponse.json(page([], {page: 2, size: 10}));
        }));

        await getActivityLog({page: 2, size: 10, tags: ['ignored']});

        expect(search).toBe('?page=2&size=10');
    });
});

describe('single sign-on', () => {
    it('builds the login url with an encoded return path', () => {
        expect(ssoLoginUrl()).toBe('/api/auth/oidc/login');
        expect(ssoLoginUrl('/notes/a?version=2')).toBe('/api/auth/oidc/login?returnTo=%2Fnotes%2Fa%3Fversion%3D2');
    });
});

describe('sessions', () => {
    it('revokes one session by id and the others in bulk', async () => {
        const deleted: string[] = [];
        server.use(
            http.delete('/api/user/sessions/:id', ({params}) => {
                deleted.push(params.id as string);
                return new HttpResponse(null, {status: 200});
            }),
            http.delete('/api/user/sessions', () => {
                deleted.push('others');
                return new HttpResponse(null, {status: 200});
            }),
        );

        await revokeSession('a/b');
        await revokeOtherSessions();

        expect(deleted).toEqual(['a/b', 'others']);
    });
});
