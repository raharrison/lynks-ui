import client from './client';
import type {NewReminder, Page, Reminder, Schedule} from '@/types';

export async function getReminders(page: number, size: number): Promise<Page<Reminder>> {
    const {data} = await client.get('/reminder', {params: {page, size}});
  return data;
}

export async function getReminder(id: string): Promise<Reminder> {
  const { data } = await client.get(`/reminder/${id}`);
  return data;
}

export async function getRemindersForEntry(entryId: string): Promise<Reminder[]> {
  const { data } = await client.get(`/entry/${entryId}/reminder`);
  return data;
}

export async function createReminder(reminder: NewReminder): Promise<Reminder> {
  const { data } = await client.post('/reminder', reminder);
  return data;
}

export async function updateReminder(reminder: NewReminder): Promise<Reminder> {
  const { data } = await client.put('/reminder', reminder);
  return data;
}

export async function deleteReminder(id: string): Promise<void> {
  await client.delete(`/reminder/${id}`);
}

export async function previewSchedule(schedule: Schedule, tz: string): Promise<string[]> {
    const {data} = await client.post('/reminder/preview', {schedule, tz});
  return data;
}
