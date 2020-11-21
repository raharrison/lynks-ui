import {Collection, Tag} from "./group.model";
import {Task} from "./task.model";

export interface BaseProperties {
  attributes: any,
  tasks: Task[]
}

export interface Entry {
  id: string,
  title: string,
  dateCreated: number,
  dateUpdated: number,
  version: number,
  starred: boolean,
  props: BaseProperties
  tags: Tag[],
  collections: Collection[],
  type: EntryType
}

export interface SlimEntry {
  id: string,
  title: string,
  dateUpdated: number,
  starred: boolean,
  tags: Tag[],
  collections: Collection[],
  type: EntryType
}

export interface NewEntry {
  id: string,
  title: string,
  tags: string[],
  collections: string[]
}

export enum EntryType {
  LINK = "LINK",
  NOTE = "NOTE",
  ENTRIES = "ENTRY"
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
