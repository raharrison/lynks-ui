import {EntryType} from "@shared/models/entry.model";
import {SortDirection} from "@shared/models/sort-config.model";

export interface EntryFilter {
  entryType: EntryType
  page: number;
  size: number;
  tags: string[];
  collections: string[];
  source: string;
  sort: string;
  direction: SortDirection;
  searchTerms: string;
}

