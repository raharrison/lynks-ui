import client from './client';
import type {Suggestion} from '@/types';

export async function suggestLink(url: string): Promise<Suggestion> {
  const { data } = await client.post('/suggest', url, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return data;
}
