import client from './client';
import type {Comment, NewComment, Page, PageRequest} from '@/types';

function buildParams(req?: PageRequest): Record<string, string> {
  const params: Record<string, string> = {};
  if (!req) return params;
  if (req.page) params.page = String(req.page);
  if (req.size) params.size = String(req.size);
  return params;
}

export async function getComments(entryId: string, req?: PageRequest): Promise<Page<Comment>> {
  const { data } = await client.get(`/entry/${entryId}/comments`, { params: buildParams(req) });
  return data;
}

export async function getComment(entryId: string, commentId: string): Promise<Comment> {
  const { data } = await client.get(`/entry/${entryId}/comments/${commentId}`);
  return data;
}

export async function createComment(entryId: string, comment: NewComment): Promise<Comment> {
  const { data } = await client.post(`/entry/${entryId}/comments`, comment);
  return data;
}

export async function updateComment(entryId: string, comment: NewComment): Promise<Comment> {
  const { data } = await client.put(`/entry/${entryId}/comments`, comment);
  return data;
}

export async function deleteComment(entryId: string, commentId: string): Promise<void> {
  await client.delete(`/entry/${entryId}/comments/${commentId}`);
}
