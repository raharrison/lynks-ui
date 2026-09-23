// Entry types
export type EntryType = 'link' | 'note' | 'snippet' | 'file';

export type SortDirection = 'asc' | 'desc' | 'rand';

// Groups
export interface Tag {
  id: string;
  name: string;
  path: string | null;
  children: Tag[];
  dateCreated: string;
  dateUpdated: string;
}

export interface Collection {
  id: string;
  name: string;
  path: string | null;
  children: Collection[];
  dateCreated: string;
  dateUpdated: string;
}

export interface NewTag {
  id?: string;
  name: string;
}

export interface NewCollection {
  id?: string;
  name: string;
  parentId?: string | null;
}

// Task definitions
export type TaskParameterType = 'bool' | 'text' | 'number' | 'enum' | 'static' | 'multi';

export interface TaskParameter {
  name: string;
  type: TaskParameterType;
  description?: string;
  value?: string;
  options?: string[];
  required: boolean;
}

export interface TaskDefinition {
  id: string;
  description: string;
  className: string;
  params: TaskParameter[];
}

// Discussions (used in link props attributes)
export interface Discussion {
  source: string;
  title: string;
  url: string;
  score: number;
  comments: number;
  created: string;
}

// Properties
export interface BaseProperties {
  attributes: Record<string, unknown>;
  tasks: TaskDefinition[];
}

export interface LinkAttributes {
  discussions?: Discussion[];
  /** false when link is alive, timestamp (ms) when processing failed */
  dead?: boolean | number;
  [key: string]: unknown;
}

export interface LinkProperties extends BaseProperties {
  attributes: LinkAttributes;
}

// Base entry interfaces
export interface SlimEntry {
  id: string;
  type: EntryType;
  dateUpdated: string;
  starred: boolean;
  tags: Tag[];
  collections: Collection[];
}

export interface Entry {
  id: string;
  type: EntryType;
  dateCreated: string;
  dateUpdated: string;
  version: number;
  starred: boolean;
  props: BaseProperties;
  tags: Tag[];
  collections: Collection[];
}

// Link
export interface Link extends Entry {
  type: 'link';
  title: string;
  url: string;
  source: string;
  content: string | null;
  thumbnailId: string | null;
  read: boolean;
  props: LinkProperties;
}

export interface SlimLink extends SlimEntry {
  type: 'link';
  title: string;
  source: string;
  thumbnailId: string | null;
  read: boolean;
}

export interface NewLink {
  id?: string;
  title: string;
  url: string;
  tags?: string[];
  collections?: string[];
  process?: boolean;
}

// Note
export interface Note extends Entry {
  type: 'note';
  title: string;
  plainContent: string;
  renderedContent: string;
}

export interface SlimNote extends SlimEntry {
  type: 'note';
  title: string;
}

export interface NewNote {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  collections?: string[];
}

// Snippet
export interface Snippet extends Entry {
  type: 'snippet';
  plainContent: string;
  renderedContent: string;
}

export interface SlimSnippet extends SlimEntry {
  type: 'snippet';
  renderedContent: string;
}

export interface NewSnippet {
  id?: string;
  content: string;
  tags?: string[];
  collections?: string[];
}

// File
export interface FileEntry extends Entry {
  type: 'file';
  title: string;
}

export interface SlimFile extends SlimEntry {
  type: 'file';
  title: string;
}

export interface NewFile {
  id?: string;
  title: string;
  tags?: string[];
  collections?: string[];
}

// Union types
export type AnyEntry = Link | Note | Snippet | FileEntry;
export type AnySlimEntry = SlimLink | SlimNote | SlimSnippet | SlimFile;
export type NewAnyEntry = NewLink | NewNote | NewSnippet | NewFile;

// Page
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
}

// Page request
export interface PageRequest {
  page?: number;
  size?: number;
  tags?: string[];
  collections?: string[];
  source?: string;
  sort?: string;
  direction?: SortDirection;
}

// Comments
export interface Comment {
  id: string;
  entryId: string;
  plainContent: string;
  renderedContent: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface NewComment {
  id?: string;
  plainContent: string;
}

// Reminders
export type ReminderType = 'adhoc' | 'recurring';
export type ReminderStatus = 'active' | 'completed' | 'disabled';
export type NotificationMethod = 'push' | 'jolt';

export interface Reminder {
  reminderId: string;
  entryId: string;
  type: ReminderType;
  notifyMethods: NotificationMethod[];
  message: string | null;
  spec: string;
  tz: string;
  status: ReminderStatus;
  dateCreated: string;
  dateUpdated: string;
}

export interface NewReminder {
  reminderId?: string;
  entryId: string;
  type: ReminderType;
  notifyMethods: NotificationMethod[];
  message?: string;
  spec: string;
  tz: string;
  status: ReminderStatus;
}

// Digest
export interface Digest {
    id: string;
    links: SlimLink[];
    dateCreated: string;
}

// Notifications
export type NotificationType = 'processed' | 'error' | 'reminder' | 'discussions' | 'digest';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  entryId: string | null;
  entryType: EntryType | null;
  entryTitle: string | null;
  dateCreated: string;
}

// Resources
export type ResourceType =
    'upload'
    | 'screenshot'
    | 'thumbnail'
    | 'preview'
    | 'page'
    | 'document'
    | 'readable_doc'
    | 'readable_text'
    | 'generated'
    | 'single_file';

export interface Resource {
  id: string;
  parentId: string;
  entryId: string;
  version: number;
  name: string;
  extension: string;
  type: ResourceType;
  size: number;
  dateCreated: string;
}

// Entry versions
export interface EntryVersion {
  id: string;
  version: number;
  dateUpdated: string;
}

// Entry audit
export interface EntryAuditItem {
  auditId: string;
  entryId: string;
  src: string | null;
  details: string;
  timestamp: string;
}

// Entry refs
export interface EntryRefItem {
  entryId: string;
  entryType: EntryType;
  title: string | null;
}

export interface EntryRefSet {
  inbound: EntryRefItem[];
  outbound: EntryRefItem[];
}

// Suggestions
export interface Suggestion {
  url: string;
  title: string | null;
  thumbnail: string | null;
  preview: string | null;
  keywords: string[];
  tags: Tag[];
  collections: Collection[];
}

// User
export interface User {
    id: string;
  username: string;
  displayName: string | null;
  digest: boolean;
    joltConfigured: boolean;
  dateCreated: string;
  dateUpdated: string;
}

export interface AuthRequest {
  username: string;
  password: string;
  totp?: string;
}

export type AuthResult = 'success' | 'totp_required' | 'invalid_credentials';

// Activity
export interface ActivityLogItem {
  id: string;
  entryId: string;
  src: string | null;
  details: string;
  entryType: EntryType;
  entryTitle: string;
  timestamp: string;
}

// Group sets
export interface GroupIdSet {
  tags: string[];
  collections: string[];
}
