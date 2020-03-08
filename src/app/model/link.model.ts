import {Entry, NewEntry} from "./entry.model";

export interface Link extends Entry {
  url: string,
  source: string,
  content: string
}

export interface NewLink extends NewEntry {
  url: string
  process: boolean
}
