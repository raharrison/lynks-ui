import {Entry, NewEntry, SlimEntry} from "./entry.model";

export interface Note extends Entry {
  plainText: string,
  markdownText: string
}

export interface SlimNote extends SlimEntry {
}

export interface NewNote extends NewEntry {
  plainText: string
}
