import {describe, expect, it} from 'vitest';
import {describeUserAgent} from './userAgent';

describe('describeUserAgent', () => {
    it.each([
        ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36', 'Chrome on Windows'],
        ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0', 'Edge on Windows'],
        ['Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0', 'Firefox on Linux'],
        ['Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15', 'Safari on macOS'],
        ['Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1', 'Safari on iOS'],
        ['Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36', 'Chrome on Android'],
    ])('describes %s', (userAgent, expected) => {
        expect(describeUserAgent(userAgent)).toBe(expected);
    });

    it('falls back to the raw string or a placeholder', () => {
        expect(describeUserAgent('curl/8.9.1')).toBe('curl/8.9.1');
        expect(describeUserAgent(null)).toBe('Unknown device');
    });
});
