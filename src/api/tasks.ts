import client from './client';

export async function runTask(entryId: string, taskId: string, params: Record<string, string>): Promise<void> {
  await client.post(`/entry/${entryId}/task/${taskId}`, params);
}
