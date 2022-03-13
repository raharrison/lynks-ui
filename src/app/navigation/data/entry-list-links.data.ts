import {EntryType} from "@shared/models";

export const entryLinkItems = [
  {name: "Entries", path: "/entries", type: EntryType.ENTRIES, icon: "table"},
  {name: "Links", path: "/entries/links", type: EntryType.LINK, icon: "link"},
  {name: "Notes", path: "/entries/notes", type: EntryType.NOTE, icon: "sticky-note"}
];
