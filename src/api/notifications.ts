import client from './client';
import type {Notification, Page, PageRequest} from '@/types';

function buildParams(req?: PageRequest): Record<string, string> {
  const params: Record<string, string> = {};
  if (!req) return params;
  if (req.page) params.page = String(req.page);
  if (req.size) params.size = String(req.size);
  return params;
}

export async function getNotifications(req?: PageRequest): Promise<Page<Notification>> {
  const { data } = await client.get('/notifications', { params: buildParams(req) });
  return data;
}

export async function getUnreadCount(): Promise<{ unread: number }> {
  const { data } = await client.get('/notifications/unread');
  return data;
}

export async function markRead(id: string): Promise<void> {
  await client.post(`/notifications/${id}/read`);
}

export async function markUnread(id: string): Promise<void> {
  await client.post(`/notifications/${id}/unread`);
}

export async function markAllRead(): Promise<{ read: number }> {
  const { data } = await client.post('/notifications/markAllRead');
  return data;
}
