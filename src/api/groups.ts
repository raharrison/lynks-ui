import client from './client';
import type {Collection, NewCollection, NewTag, Tag} from '@/types';

// Tags
export async function getTags(): Promise<Tag[]> {
  const { data } = await client.get('/tag');
  return data;
}

export async function getTag(id: string): Promise<Tag> {
  const { data } = await client.get(`/tag/${id}`);
  return data;
}

export async function createTag(tag: NewTag): Promise<Tag> {
  const { data } = await client.post('/tag', tag);
  return data;
}

export async function updateTag(tag: NewTag): Promise<Tag> {
  const { data } = await client.put('/tag', tag);
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  await client.delete(`/tag/${id}`);
}

export async function refreshTags(): Promise<void> {
  await client.post('/tag/refresh');
}

// Collections
export async function getCollections(): Promise<Collection[]> {
  const { data } = await client.get('/collection');
  return data;
}

export async function getCollection(id: string): Promise<Collection> {
  const { data } = await client.get(`/collection/${id}`);
  return data;
}

export async function createCollection(collection: NewCollection): Promise<Collection> {
  const { data } = await client.post('/collection', collection);
  return data;
}

export async function updateCollection(collection: NewCollection): Promise<Collection> {
  const { data } = await client.put('/collection', collection);
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  await client.delete(`/collection/${id}`);
}

export async function refreshCollections(): Promise<void> {
  await client.post('/collection/refresh');
}
