import {EntryType} from "@shared/models/entry.model";
import {Collection, Tag} from "@shared/models/group.model";
import {SortDirection} from "@shared/models/sort-config.model";

export interface EntryFilter {
  entryType: EntryType
  page: number;
  size: number;
  tags: Tag[];
  collections: Collection[];
  source: string;
  sort: string;
  direction: SortDirection;
}

