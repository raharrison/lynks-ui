import {Entry, NewEntry, SlimEntry} from "./entry.model";

export interface Snippet extends Entry {
  plainText: string,
  markdownText: string
}

export interface SlimSnippet extends SlimEntry {
  markdownText: string;
}

export interface NewSnippet extends NewEntry {
  plainText: string
}
