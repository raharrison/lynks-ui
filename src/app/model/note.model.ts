import {Entry, NewEntry} from "./entry.model";

export interface Note extends Entry {
    plainText: string,
    markdownText: string
}

export interface NewNote extends NewEntry {
    plainText: string
}
