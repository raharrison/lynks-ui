import type {
    ActivityLogItem,
    AuthConfig,
    Collection,
    Comment,
    Digest,
    Discussion,
    FileEntry,
    Link,
    Note,
    Notification,
    Page,
    Reminder,
    Resource,
    SlimLink,
    SlimNote,
    SlimSnippet,
    Snippet,
    Tag,
    User,
    UserSession,
} from '@/types';

const NOW = '2026-01-15T12:00:00Z';

export function page<T>(content: T[], overrides: Partial<Page<T>> = {}): Page<T> {
    return {content, page: 1, size: 25, total: content.length, ...overrides};
}

export function tag(overrides: Partial<Tag> = {}): Tag {
    return {id: 'tag1', name: 'Tag', path: null, children: [], dateCreated: NOW, dateUpdated: NOW, ...overrides};
}

export function collection(overrides: Partial<Collection> = {}): Collection {
    return {id: 'col1', name: 'Collection', path: null, children: [], dateCreated: NOW, dateUpdated: NOW, ...overrides};
}

export function slimLink(overrides: Partial<SlimLink> = {}): SlimLink {
    return {
        id: 'link1',
        type: 'link',
        title: 'A link',
        source: 'example.com',
        thumbnailId: null,
        read: false,
        starred: false,
        dateUpdated: NOW,
        tags: [],
        collections: [],
        ...overrides,
    };
}

export function slimNote(overrides: Partial<SlimNote> = {}): SlimNote {
    return {
        id: 'note1',
        type: 'note',
        title: 'A note',
        starred: false,
        dateUpdated: NOW,
        tags: [],
        collections: [], ...overrides
    };
}

export function slimSnippet(overrides: Partial<SlimSnippet> = {}): SlimSnippet {
    return {
        id: 'snip1',
        type: 'snippet',
        renderedContent: '<p>code</p>',
        starred: false,
        dateUpdated: NOW,
        tags: [],
        collections: [],
        ...overrides,
    };
}

const entryBase = () => ({
    version: 1,
    starred: false,
    dateCreated: NOW,
    dateUpdated: NOW,
    props: {attributes: {}, tasks: []},
    tags: [],
    collections: [],
});

export function link(overrides: Partial<Link> = {}): Link {
    return {
        ...entryBase(),
        id: 'link1',
        type: 'link',
        title: 'A link',
        url: 'https://example.com',
        source: 'example.com',
        content: null,
        thumbnailId: null,
        read: false,
        ...overrides,
    };
}

export function note(overrides: Partial<Note> = {}): Note {
    return {
        ...entryBase(),
        id: 'note1',
        type: 'note',
        title: 'A note',
        plainContent: 'Body',
        renderedContent: '<p>Body</p>',
        ...overrides,
    };
}

export function snippet(overrides: Partial<Snippet> = {}): Snippet {
    return {...entryBase(), id: 'snip1', type: 'snippet', plainContent: 'code', renderedContent: '<p>code</p>', ...overrides};
}

export function fileEntry(overrides: Partial<FileEntry> = {}): FileEntry {
    return {...entryBase(), id: 'file1', type: 'file', title: 'A file', ...overrides};
}

export function resource(overrides: Partial<Resource> = {}): Resource {
    return {
        id: 'res1',
        parentId: 'link1',
        entryId: 'link1',
        version: 1,
        name: 'screenshot.png',
        extension: 'png',
        type: 'screenshot',
        size: 2048,
        dateCreated: NOW,
        ...overrides,
    };
}

export function comment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 'c1',
        entryId: 'link1',
        plainContent: 'Nice',
        renderedContent: '<p>Nice</p>',
        dateCreated: NOW,
        dateUpdated: NOW,
        ...overrides,
    };
}

export function discussion(overrides: Partial<Discussion> = {}): Discussion {
    return {
        source: 'hacker_news',
        title: 'Discussed on HN',
        url: 'https://news.ycombinator.com/item?id=1',
        score: 120,
        comments: 45,
        created: NOW,
        ...overrides,
    };
}

export function activity(overrides: Partial<ActivityLogItem> = {}): ActivityLogItem {
    return {
        id: 'a1',
        entryId: 'link1',
        src: null,
        details: 'Created',
        entryType: 'link',
        entryTitle: 'A link',
        timestamp: NOW,
        ...overrides,
    };
}

export function digest(overrides: Partial<Digest> = {}): Digest {
    return {id: 'digest1', links: [], dateCreated: NOW, ...overrides};
}

export function notification(overrides: Partial<Notification> = {}): Notification {
    return {
        id: 'n1',
        type: 'processed',
        message: 'Link processed',
        read: false,
        entryId: 'link1',
        entryType: 'link',
        entryTitle: 'A link',
        dateCreated: NOW,
        ...overrides,
    };
}

const reminderBase = {
    reminderId: 'r1',
    entryId: 'link1',
    notifyMethods: ['push' as const],
    message: null,
    tz: 'UTC',
    status: 'active' as const,
    dateCreated: NOW,
    dateUpdated: NOW,
    entryType: 'link' as const,
    entryTitle: 'A link',
};

type AdhocReminder = Extract<Reminder, { type: 'adhoc' }>;
type RecurringReminder = Extract<Reminder, { type: 'recurring' }>;

export function adhocReminder(overrides: Partial<AdhocReminder> = {}): AdhocReminder {
    return {...reminderBase, type: 'adhoc', fireAt: Date.parse('2099-01-01T09:00:00Z'), ...overrides};
}

export function recurringReminder(overrides: Partial<RecurringReminder> = {}): RecurringReminder {
    return {...reminderBase, type: 'recurring', schedule: {kind: 'calendar', at: '09:00'}, ...overrides};
}

export function user(overrides: Partial<User> = {}): User {
    return {
        id: 'u1',
        username: 'ryan',
        displayName: null,
        digest: false,
        joltConfigured: false,
        dateCreated: NOW,
        dateUpdated: NOW,
        ...overrides,
    };
}

export function userSession(overrides: Partial<UserSession> = {}): UserSession {
    return {
        id: 's1',
        method: 'password',
        created: NOW,
        lastSeen: NOW,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
        ip: '203.0.113.4',
        current: false,
        ...overrides,
    };
}

export function authConfig(overrides: Partial<AuthConfig> = {}): AuthConfig {
    return {passwordLogin: true, sso: null, ...overrides};
}
