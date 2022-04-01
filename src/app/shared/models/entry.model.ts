import {Collection, Tag} from "./group.model";
import {TaskDefinition} from "./task.model";

export interface BaseProperties {
  attributes: any,
  tasks: TaskDefinition[]
}

export interface Entry {
  id: string,
  dateCreated: number,
  dateUpdated: number,
  version: number,
  starred: boolean,
  read: boolean,
  props: BaseProperties
  tags: Tag[],
  collections: Collection[],
  type: EntryType
}

export interface SlimEntry {
  id: string,
  dateUpdated: number,
  starred: boolean,
  tags: Tag[],
  collections: Collection[],
  type: EntryType
}

export interface NewEntry {
  id: string,
  tags: string[],
  collections: string[]
}

export enum EntryType {
  LINK = "link",
  NOTE = "note",
  SNIPPET = "snippet",
  ENTRIES = "entry"
}

export interface EntryVersion {
  id: string,
  version: number,
  dateUpdated: number
}

export interface EntryAuditItem {
  auditId: string,
  entryId: string,
  src: string,
  details: string,
  timestamp: number
}
