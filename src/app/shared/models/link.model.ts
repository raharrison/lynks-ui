import {Entry, NewEntry, SlimEntry} from "./entry.model";
import {Collection, Tag} from "./group.model";

export interface Link extends Entry {
  title: string,
  url: string,
  source: string,
  thumbnailId: string
}

export interface SlimLink extends SlimEntry {
  title: string,
  source: string,
  thumbnailId: string
}

export interface NewLink extends NewEntry {
  title: string,
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
