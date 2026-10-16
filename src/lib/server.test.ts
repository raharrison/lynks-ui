import {describe, expect, it} from 'vitest';
import {http, HttpResponse} from 'msw';
import {server} from '@/test/server';
import {apiBaseUrl, normaliseServerUrl, probeServer} from './server';

describe('normaliseServerUrl', () => {
    it.each([
        ['lynks.example.com', 'https://lynks.example.com'],
        ['  lynks.example.com/  ', 'https://lynks.example.com'],
        ['http://192.168.1.5:8080', 'http://192.168.1.5:8080'],
        ['https://lynks.example.com/api', 'https://lynks.example.com'],
        ['https://example.com/lynks/api/', 'https://example.com/lynks'],
    ])('normalises %s', (input, expected) => {
        expect(normaliseServerUrl(input)).toBe(expected);
    });

    it('refuses what is not an address', () => {
        expect(() => normaliseServerUrl('   ')).toThrow('Enter a server address');
        expect(() => normaliseServerUrl('https://')).toThrow('That is not a valid address');
    });
});

describe('probeServer', () => {
    it('recognises Lynks by its health response', async () => {
        server.use(http.get('https://lynks.test/api/health', () =>
            HttpResponse.json({status: 'up', application: 'lynks', version: '2.1.0'})));
        await expect(probeServer('https://lynks.test')).resolves.toEqual({ok: true, version: '2.1.0'});
    });

    it('tells another application apart', async () => {
        server.use(http.get('https://lynks.test/api/health', () =>
            HttpResponse.json({status: 'up', application: 'jolt'})));
        await expect(probeServer('https://lynks.test')).resolves.toEqual({ok: false, reason: 'not-lynks'});
    });

    it('reads a 404 as the wrong address and a 502 as a server that is down', async () => {
        server.use(http.get('https://lynks.test/api/health', () => new HttpResponse(null, {status: 404})));
        await expect(probeServer('https://lynks.test')).resolves.toEqual({ok: false, reason: 'not-lynks'});

        server.use(http.get('https://lynks.test/api/health', () => new HttpResponse(null, {status: 502})));
        await expect(probeServer('https://lynks.test')).resolves.toEqual({ok: false, reason: 'unreachable'});
    });

    it('reads a network failure as unreachable', async () => {
        server.use(http.get('https://lynks.test/api/health', () => HttpResponse.error()));
        await expect(probeServer('https://lynks.test')).resolves.toEqual({ok: false, reason: 'unreachable'});
    });
});

describe('apiBaseUrl', () => {
    it('is the same origin in a browser', () => {
        expect(apiBaseUrl()).toBe('/api');
    });
});
