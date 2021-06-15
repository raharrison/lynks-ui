import {Entry, NewEntry, SlimEntry} from "./entry.model";
import {Collection, Tag} from "./group.model";

export interface Link extends Entry {
  url: string,
  source: string,
  content: string
}

export interface SlimLink extends SlimEntry {
  source: string
}

export interface NewLink extends NewEntry {
  url: string
  process: boolean
}

export interface Suggestion {
  url: string,
  title: string,
  thumbnail: string,
  preview: string,
  keywords: string[],
  tags: Tag[],
  collections: Collection[]
}
