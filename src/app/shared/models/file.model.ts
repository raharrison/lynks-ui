import {Entry, NewEntry, SlimEntry} from "./entry.model";

export interface File extends Entry {
  title: string
}

export interface SlimFile extends SlimEntry {
  title: string;
}

export interface NewFile extends NewEntry {
  title: string;
}
