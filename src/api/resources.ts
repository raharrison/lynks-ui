import client from './client';
import type {Resource} from '@/types';

export async function getResources(entryId: string): Promise<Resource[]> {
  const { data } = await client.get(`/entry/${entryId}/resource`);
  return data;
}

export async function getResourceInfo(entryId: string, resourceId: string): Promise<Resource> {
  const { data } = await client.get(`/entry/${entryId}/resource/${resourceId}/info`);
  return data;
}

export function getResourceUrl(entryId: string, resourceId: string): string {
  return `/api/entry/${entryId}/resource/${resourceId}`;
}

export async function uploadResource(entryId: string, file: File): Promise<Resource> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post(`/entry/${entryId}/resource`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateResource(entryId: string, resource: Resource): Promise<Resource> {
  const { data } = await client.put(`/entry/${entryId}/resource`, resource);
  return data;
}

export async function deleteResource(entryId: string, resourceId: string): Promise<void> {
  await client.delete(`/entry/${entryId}/resource/${resourceId}`);
}
