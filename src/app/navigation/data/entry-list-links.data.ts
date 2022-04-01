import {EntryType} from "@shared/models";

export const entryLinkItems = [
  {name: "Entries", path: "/entries", type: EntryType.ENTRIES, icon: "table"},
  {name: "Links", path: "/entries/links", type: EntryType.LINK, icon: "link"},
  {name: "Notes", path: "/entries/notes", type: EntryType.NOTE, icon: "book"},
  {name: "Snippets", path: "/entries/snippets", type: EntryType.SNIPPET, icon: "sticky-note"}
];
