import {beforeEach, describe, expect, it} from 'vitest';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {user} from '@/test/fixtures';
import {useAuthStore} from '@/stores/authStore';
import client from './client';

describe('api client', () => {
    beforeEach(() => {
        useAuthStore.setState({user: user()});
    });

    it('sends requests under /api with credentials', async () => {
        let seen: Request | undefined;
        server.use(http.get('/api/ping', ({request}) => {
            seen = request;
            return HttpResponse.json({ok: true});
        }));

        const {data} = await client.get('/ping');

        expect(data).toEqual({ok: true});
        expect(new URL(seen!.url).pathname).toBe('/api/ping');
        expect(client.defaults.withCredentials).toBe(true);
    });

    it('clears the session on a 401', async () => {
        server.use(http.get('/api/entry', () => new HttpResponse(null, {status: 401})));

        await expect(client.get('/entry')).rejects.toMatchObject({response: {status: 401}});
        expect(useAuthStore.getState().user).toBeNull();
    });

    it('leaves the session alone when the request opts out of the redirect', async () => {
        server.use(http.get('/api/user', () => new HttpResponse(null, {status: 401})));

        await expect(client.get('/user', {suppressRedirect: true})).rejects.toBeTruthy();
        expect(useAuthStore.getState().user).not.toBeNull();
    });

    it('does not redirect when already on the login page', async () => {
        window.history.replaceState(null, '', '/login');
        server.use(http.get('/api/entry', () => new HttpResponse(null, {status: 401})));

        await expect(client.get('/entry')).rejects.toBeTruthy();
        expect(useAuthStore.getState().user).not.toBeNull();
    });

    it('passes other errors through untouched', async () => {
        server.use(http.get('/api/entry', () => HttpResponse.json({message: 'boom'}, {status: 500})));

        await expect(client.get('/entry')).rejects.toMatchObject({response: {status: 500, data: {message: 'boom'}}});
        expect(useAuthStore.getState().user).not.toBeNull();
    });
});
