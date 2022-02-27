import {Entry, NewEntry, SlimEntry} from "./entry.model";

export interface Note extends Entry {
  title: string,
  plainText: string,
  markdownText: string
}

export interface SlimNote extends SlimEntry {
  title: string
}

export interface NewNote extends NewEntry {
  title: string,
  plainText: string
}
