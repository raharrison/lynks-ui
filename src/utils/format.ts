import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ENTRY_TYPE_COLORS, ENTRY_TYPE_LABELS } from '@/utils/constants';

dayjs.extend(relativeTime);

export function formatDate(timestamp: number): string {
  return dayjs(timestamp).format('MMM D, YYYY');
}

export function formatDateTime(timestamp: number): string {
  return dayjs(timestamp).format('MMM D, YYYY h:mm A');
}

export function formatRelative(timestamp: number): string {
  return dayjs(timestamp).fromNow();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function entryTypeLabel(type: string): string {
  return ENTRY_TYPE_LABELS[type as keyof typeof ENTRY_TYPE_LABELS] ?? (type.charAt(0).toUpperCase() + type.slice(1).toLowerCase());
}

export function entryTypeColor(type: string): string {
  return ENTRY_TYPE_COLORS[type as keyof typeof ENTRY_TYPE_COLORS] ?? 'default';
}

export const ENTRY_PATH_PREFIX: Record<string, string> = {
  link: 'links', note: 'notes', snippet: 'snippets', file: 'files',
};

export function entryDetailPath(type: string, id: string): string {
  return `/${ENTRY_PATH_PREFIX[type] || type}/${id}`;
}

export function entryCreatePath(type: string): string {
  return `/${ENTRY_PATH_PREFIX[type] || type}/create`;
}

export function entryEditPath(type: string, id: string): string {
  return `/${ENTRY_PATH_PREFIX[type] || type}/${id}/edit`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
