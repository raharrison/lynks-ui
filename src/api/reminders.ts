import client from './client';
import type {NewReminder, Reminder} from '@/types';

export async function getReminders(): Promise<Reminder[]> {
  const { data } = await client.get('/reminder');
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

export async function validateSchedule(spec: string): Promise<string> {
  const { data } = await client.post('/reminder/validate', spec, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return data;
}
