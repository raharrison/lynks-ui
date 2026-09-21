import client from './client';
import type {
  AnyEntry,
  AnySlimEntry,
  EntryAuditItem,
  EntryRefSet,
  EntryVersion,
  FileEntry,
  GroupIdSet,
  Link,
  NewFile,
  NewLink,
  NewNote,
  NewSnippet,
  Note,
  Page,
  PageRequest,
  Snippet,
} from '@/types';

function buildParams(req?: PageRequest): Record<string, string> {
  const params: Record<string, string> = {};
  if (!req) return params;
  if (req.page) params.page = String(req.page);
  if (req.size) params.size = String(req.size);
  if (req.tags?.length) params.tags = req.tags.join(',');
  if (req.collections?.length) params.collections = req.collections.join(',');
  if (req.source) params.source = req.source;
  if (req.sort) params.sort = req.sort;
  if (req.direction) params.direction = req.direction;
  return params;
}

// Generic entries
export async function getEntries(req?: PageRequest): Promise<Page<AnySlimEntry>> {
  const { data } = await client.get('/entry', { params: buildParams(req) });
  return data;
}

export async function getEntry(id: string): Promise<AnyEntry> {
  const { data } = await client.get(`/entry/${id}`);
  return data;
}

export async function getEntryVersion(id: string, version: number): Promise<AnyEntry> {
  const { data } = await client.get(`/entry/${id}/${version}`);
  return data;
}

export async function searchEntries(query: string, req?: PageRequest): Promise<Page<AnySlimEntry>> {
  const { data } = await client.get('/entry/search', { params: { q: query, ...buildParams(req) } });
  return data;
}

export async function suggestEntries(query: string, req?: PageRequest): Promise<Page<AnySlimEntry>> {
    const {data} = await client.get('/entry/suggest', {params: {q: query, ...buildParams(req)}});
    return data;
}

export async function resolveEntries(ids: string[]): Promise<AnySlimEntry[]> {
  const {data} = await client.get('/entry/resolve', {params: {ids: ids.join(',')}});
  return data;
}

export async function starEntry(id: string): Promise<AnyEntry> {
  const { data } = await client.post(`/entry/${id}/star`);
  return data;
}

export async function unstarEntry(id: string): Promise<AnyEntry> {
  const { data } = await client.post(`/entry/${id}/unstar`);
  return data;
}

export async function updateEntryGroups(id: string, groups: GroupIdSet): Promise<void> {
  await client.put(`/entry/${id}/groups`, groups);
}

export async function getEntryVersions(id: string): Promise<EntryVersion[]> {
  const { data } = await client.get(`/entry/${id}/history`);
  return data;
}

export async function getEntryAudit(id: string): Promise<EntryAuditItem[]> {
  const { data } = await client.get(`/entry/${id}/audit`);
  return data;
}

export async function getEntryRefs(id: string): Promise<EntryRefSet> {
  const { data } = await client.get(`/entry/${id}/refs`);
  return data;
}

// Links
export async function getLinks(req?: PageRequest): Promise<Page<AnySlimEntry>> {
  const { data } = await client.get('/link', { params: buildParams(req) });
  return data;
}

export async function getLink(id: string): Promise<Link> {
  const { data } = await client.get(`/link/${id}`);
  return data;
}

export async function createLink(link: NewLink): Promise<Link> {
  const { data } = await client.post('/link', link);
  return data;
}

export async function updateLink(link: NewLink): Promise<Link> {
  const { data } = await client.put('/link', link);
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  await client.delete(`/link/${id}`);
}

export async function updateLinkContent(id: string, content: string): Promise<string> {
  const { data } = await client.post(`/link/${id}/content`, content, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return (data as { content: string }).content;
}

export async function markLinkRead(id: string): Promise<Link> {
  const { data } = await client.post(`/link/${id}/read`);
  return data;
}

export async function markLinkUnread(id: string): Promise<Link> {
  const { data } = await client.post(`/link/${id}/unread`);
  return data;
}

export async function checkExistingLink(url: string): Promise<Link[]> {
  const { data } = await client.post('/link/checkExisting', url, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return data;
}

// Notes
export async function getNotes(req?: PageRequest): Promise<Page<AnySlimEntry>> {
  const { data } = await client.get('/note', { params: buildParams(req) });
  return data;
}

export async function getNote(id: string): Promise<Note> {
  const { data } = await client.get(`/note/${id}`);
  return data;
}

export async function createNote(note: NewNote): Promise<Note> {
  const { data } = await client.post('/note', note);
  return data;
}

export async function updateNote(note: NewNote): Promise<Note> {
  const { data } = await client.put('/note', note);
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await client.delete(`/note/${id}`);
}

// Snippets
export async function getSnippets(req?: PageRequest): Promise<Page<AnySlimEntry>> {
  const { data } = await client.get('/snippet', { params: buildParams(req) });
  return data;
}

export async function getSnippet(id: string): Promise<Snippet> {
  const { data } = await client.get(`/snippet/${id}`);
  return data;
}

export async function createSnippet(snippet: NewSnippet): Promise<Snippet> {
  const { data } = await client.post('/snippet', snippet);
  return data;
}

export async function updateSnippet(snippet: NewSnippet): Promise<Snippet> {
  const { data } = await client.put('/snippet', snippet);
  return data;
}

export async function deleteSnippet(id: string): Promise<void> {
  await client.delete(`/snippet/${id}`);
}

// Files
export async function getFiles(req?: PageRequest): Promise<Page<AnySlimEntry>> {
  const { data } = await client.get('/file', { params: buildParams(req) });
  return data;
}

export async function getFile(id: string): Promise<FileEntry> {
  const { data } = await client.get(`/file/${id}`);
  return data;
}

export async function createFile(file: NewFile): Promise<FileEntry> {
  const { data } = await client.post('/file', file);
  return data;
}

export async function updateFile(file: NewFile): Promise<FileEntry> {
  const { data } = await client.put('/file', file);
  return data;
}

export async function deleteFile(id: string): Promise<void> {
  await client.delete(`/file/${id}`);
}
