import {describe, expect, it} from 'vitest';
import {http, HttpResponse, type JsonBodyType} from 'msw';
import {server} from '@/test/server';
import {note, page, slimLink} from '@/test/fixtures';
import {checkExistingLink, getEntries, getLinks, resolveEntries, revertEntry, searchEntries, updateLinkContent} from './entries';

function captureGet(path: string, response: JsonBodyType) {
    const seen: { params?: URLSearchParams } = {};
    server.use(http.get(path, ({request}) => {
        seen.params = new URL(request.url).searchParams;
        return HttpResponse.json(response);
    }));
    return seen;
}

describe('entry list params', () => {
    it('sends nothing for an empty request', async () => {
        const seen = captureGet('/api/entry', page([]));
        await getEntries();
        expect([...seen.params!]).toEqual([]);
    });

    it('serialises every field, joining lists with commas', async () => {
        const seen = captureGet('/api/link', page([]));

        await getLinks({
            page: 2, size: 50, tags: ['a', 'b'], collections: ['c'], source: 'hn', sort: 'title', direction: 'asc',
        });

        expect(Object.fromEntries(seen.params!)).toEqual({
            page: '2', size: '50', tags: 'a,b', collections: 'c', source: 'hn', sort: 'title', direction: 'asc',
        });
    });

    it('omits empty lists', async () => {
        const seen = captureGet('/api/entry', page([]));
        await getEntries({tags: [], collections: []});
        expect(seen.params!.has('tags')).toBe(false);
        expect(seen.params!.has('collections')).toBe(false);
    });

    it('adds the query to a search', async () => {
        const seen = captureGet('/api/entry/search', page([slimLink()]));

        const result = await searchEntries('rust async', {page: 1});

        expect(seen.params!.get('q')).toBe('rust async');
        expect(seen.params!.get('page')).toBe('1');
        expect(result.content).toHaveLength(1);
    });

    it('resolves ids as a single comma separated param', async () => {
        const seen = captureGet('/api/entry/resolve', []);
        await resolveEntries(['a', 'b', 'c']);
        expect(seen.params!.get('ids')).toBe('a,b,c');
    });
});

describe('plain text bodies', () => {
    it('posts the url to check for existing links as text', async () => {
        let contentType: string | null = null;
        let body = '';
        server.use(http.post('/api/link/checkExisting', async ({request}) => {
            contentType = request.headers.get('content-type');
            body = await request.text();
            return HttpResponse.json([]);
        }));

        await checkExistingLink('https://example.com/a');

        expect(contentType).toContain('text/plain');
        expect(body).toBe('https://example.com/a');
    });

    it('unwraps updated link content', async () => {
        server.use(http.post('/api/link/l1/content', () => HttpResponse.json({content: 'new body'})));
        await expect(updateLinkContent('l1', 'new body')).resolves.toBe('new body');
    });
});

describe('revertEntry', () => {
    it('posts to the typed revert path', async () => {
        const reverted = note({id: 'n1', version: 4});
        server.use(http.post('/api/note/n1/revert/2', () => HttpResponse.json(reverted)));
        await expect(revertEntry('note', 'n1', 2)).resolves.toEqual(reverted);
    });
});
