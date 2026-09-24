import {afterEach, describe, expect, it, vi} from 'vitest';
import {
    entryCreatePath,
    entryDetailPath,
    entryEditPath,
    entryTypeChipClass,
    formatDate,
    formatDateTime,
    formatFileSize,
    formatRelative,
    truncate,
} from './format';

describe('formatFileSize', () => {
    it.each([
        [0, '0 B'],
        [512, '512 B'],
        [1024, '1 KB'],
        [1536, '1.5 KB'],
        [1024 * 1024, '1 MB'],
        [5.25 * 1024 * 1024 * 1024, '5.3 GB'],
    ])('%i -> %s', (bytes, expected) => {
        expect(formatFileSize(bytes)).toBe(expected);
    });
});

describe('dates', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('formats a date and a date time', () => {
        expect(formatDate('2026-03-04T15:07:00Z')).toBe('Mar 4, 2026');
        expect(formatDateTime('2026-03-04T15:07:00Z')).toBe('Mar 4, 2026 3:07 PM');
    });

    it('formats relative to now', () => {
        vi.useFakeTimers({now: new Date('2026-03-04T15:00:00Z')});
        expect(formatRelative('2026-03-04T12:00:00Z')).toBe('3 hours ago');
    });
});

describe('truncate', () => {
    it('leaves short text alone', () => {
        expect(truncate('hello', 5)).toBe('hello');
    });

    it('cuts long text and marks it', () => {
        expect(truncate('hello world', 5)).toBe('hello...');
    });
});

describe('entry paths', () => {
    it('uses the plural prefix for each type', () => {
        expect(entryDetailPath('link', 'a')).toBe('/links/a');
        expect(entryDetailPath('note', 'a')).toBe('/notes/a');
        expect(entryDetailPath('snippet', 'a')).toBe('/snippets/a');
        expect(entryDetailPath('file', 'a')).toBe('/files/a');
    });

    it('builds create and edit paths', () => {
        expect(entryCreatePath('note')).toBe('/notes/create');
        expect(entryEditPath('snippet', 'x')).toBe('/snippets/x/edit');
    });

    it('falls back to the raw type for an unknown one', () => {
        expect(entryDetailPath('mystery', 'a')).toBe('/mystery/a');
    });
});

describe('entryTypeChipClass', () => {
    it('adds the type modifier', () => {
        expect(entryTypeChipClass('note')).toBe('lynks-chip lynks-chip-type lynks-chip-type-note');
    });

    it('omits the modifier for an unknown type', () => {
        expect(entryTypeChipClass('mystery')).toBe('lynks-chip lynks-chip-type');
    });
});
