import {Entry, NewEntry, SlimEntry} from "./entry.model";

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
  screenshot: string
}
