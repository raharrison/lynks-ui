import {describe, expect, it} from 'vitest';
import {QK} from './queryKeys';

// Invalidation matches by prefix, so these relationships are what make a mutation refresh the right lists.
function isPrefix(prefix: readonly unknown[], key: readonly unknown[]) {
    return prefix.every((part, i) => key[i] === part);
}

describe('QK', () => {
    it('invalidating all reminders covers every page and every entry list', () => {
        expect(isPrefix(QK.allReminders(), QK.allReminders(3))).toBe(true);
        expect(isPrefix(QK.allReminders(), QK.reminders('e1'))).toBe(true);
    });

    it('invalidating notifications covers the unread count and every page', () => {
        expect(isPrefix(QK.notifications(), QK.unread())).toBe(true);
        expect(isPrefix(QK.notifications(), QK.notifications(2))).toBe(true);
    });

    it('an entry key covers its versions', () => {
        expect(isPrefix(QK.entry('e1'), QK.entry('e1', 3))).toBe(true);
        expect(QK.entry('e1', null)).toEqual(['entry', 'e1']);
    });

    it('entry list keys are not under the single entry key', () => {
        expect(isPrefix(QK.entry('e1'), QK.entries())).toBe(false);
        expect(isPrefix(QK.entries(), QK.entry('e1'))).toBe(false);
    });
});
