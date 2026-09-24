import {describe, expect, it} from 'vitest';
import {buildFilterUrl, LIST_PATHS, parseSearchParams, pathToType} from './useUrlFilterSync';

describe('parseSearchParams', () => {
    it('returns defaults for an empty query', () => {
        expect(parseSearchParams('')).toEqual({
            tags: [],
            collections: [],
            searchQuery: '',
            source: '',
            sort: 'dateUpdated',
            direction: 'desc',
            page: 1,
            size: 25,
        });
    });

    it('reads every field', () => {
        expect(parseSearchParams('?tags=a,b&collections=c&q=hello%20world&source=hn&sort=title&dir=asc&page=3&size=50'))
            .toEqual({
                tags: ['a', 'b'],
                collections: ['c'],
                searchQuery: 'hello world',
                source: 'hn',
                sort: 'title',
                direction: 'asc',
                page: 3,
                size: 50,
            });
    });

    it('drops empty ids and ignores unparseable numbers', () => {
        const parsed = parseSearchParams('?tags=a,,b,&page=abc&size=0');
        expect(parsed.tags).toEqual(['a', 'b']);
        expect(parsed.page).toBe(1);
        expect(parsed.size).toBe(25);
    });
});

describe('buildFilterUrl', () => {
    it('omits defaults so a clean list has a clean url', () => {
        expect(buildFilterUrl({}, '/', '')).toBe('/');
        expect(buildFilterUrl({sort: 'dateUpdated', direction: 'desc', size: 25}, '/links', '')).toBe('/links');
    });

    it('merges overrides onto the current params', () => {
        expect(buildFilterUrl({tags: ['a', 'b']}, '/', '?q=foo&sort=title'))
            .toBe('/?tags=a%2Cb&q=foo&sort=title');
    });

    it('resets the page on any filter change', () => {
        expect(buildFilterUrl({tags: ['x']}, '/', '?page=4')).toBe('/?tags=x');
    });

    it('keeps an explicit page', () => {
        expect(buildFilterUrl({page: 2}, '/', '?q=foo')).toBe('/?q=foo&page=2');
    });

    it('clears a filter with an empty value', () => {
        expect(buildFilterUrl({searchQuery: ''}, '/', '?q=foo&source=hn')).toBe('/?source=hn');
        expect(buildFilterUrl({tags: []}, '/', '?tags=a')).toBe('/');
    });

    it('round trips through parseSearchParams', () => {
        const url = buildFilterUrl(
            {
                tags: ['a'],
                collections: ['b'],
                searchQuery: 'x y',
                source: 's',
                sort: 'title',
                direction: 'rand',
                page: 2,
                size: 10
            },
            '/',
            '',
        );
        expect(parseSearchParams(url.slice(1))).toEqual({
            tags: ['a'], collections: ['b'], searchQuery: 'x y', source: 's', sort: 'title', direction: 'rand', page: 2, size: 10,
        });
    });

    it('reads window.location.search by default', () => {
        window.history.replaceState(null, '', '/?source=hn');
        expect(buildFilterUrl({tags: ['a']})).toBe('/?tags=a&source=hn');
    });
});

describe('pathToType', () => {
    it('maps each list path to its entry type', () => {
        expect(pathToType).toEqual({
            '/': null,
            '/links': 'link',
            '/notes': 'note',
            '/snippets': 'snippet',
            '/files': 'file',
        });
        expect(LIST_PATHS).toEqual(Object.keys(pathToType));
    });
});
