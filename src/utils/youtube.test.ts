import {describe, expect, it} from 'vitest';
import {getYouTubeId} from './youtube';

describe('getYouTubeId', () => {
    it.each([
        ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=42', 'dQw4w9WgXcQ'],
        ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
        ['https://youtu.be/dQw4w9WgXcQ?t=10', 'dQw4w9WgXcQ'],
    ])('extracts the id from %s', (url, id) => {
        expect(getYouTubeId(url)).toBe(id);
    });

    it.each([
        'https://example.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/channel/abc',
        'https://youtu.be/',
        'not a url',
        '',
    ])('returns null for %s', (url) => {
        expect(getYouTubeId(url)).toBeNull();
    });
});
