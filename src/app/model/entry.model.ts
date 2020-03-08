import {Collection, Tag} from "./group.model";

export interface BaseProperties {
  attributes: any,
  tasks: { id: string, description: string }[]
}

export interface Entry {
  id: string,
  title: string
  dateUpdated: number,
  version: number,
  starred: boolean,
  props: BaseProperties
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
  NOTE = "NOTE"
}

