import type { EntryType, NotificationMethod } from '@/types';

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  link: 'Link',
  note: 'Note',
  snippet: 'Snippet',
  file: 'File',
};

export const ENTRY_TYPE_COLORS: Record<EntryType, string> = {
  link: 'blue',
  note: 'green',
  snippet: 'orange',
  file: 'purple',
};

export const SORT_OPTIONS = [
  { label: 'Updated', value: 'dateUpdated' },
  { label: 'Created', value: 'dateCreated' },
  { label: 'Title', value: 'title' },
  { label: 'Starred', value: 'starred' },
  { label: 'Source', value: 'src' },
];

export const SEARCH_SORT_OPTIONS = [
  ...SORT_OPTIONS,
  { label: 'Relevance', value: 'mostRelevant' },
];

export const PAGE_SIZE_OPTIONS = ['10', '25', '50'] as const;

export const NOTIFICATION_POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const MOBILE_BREAKPOINT = 768;

export const MENTION_RESULTS_SIZE = 6;

export const COMMENTS_PAGE_SIZE = 100;

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const IMAGE_UPLOAD_PATH = '/imageUpload';

export const REDDIT_BASE_URL = 'https://old.reddit.com';

export const NOTIFICATION_METHOD_OPTIONS: { label: string; value: NotificationMethod }[] = [
  { label: 'Web', value: 'web' },
  { label: 'Email', value: 'email' },
  { label: 'Pushover', value: 'pushover' },
];
