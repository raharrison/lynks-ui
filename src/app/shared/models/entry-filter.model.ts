import {EntryType} from "@shared/models/entry.model";
import {Collection, Tag} from "@shared/models/group.model";

export interface EntryFilter {

  entryType: EntryType
  page: number;
  size: number;
  tags: Tag[];
  collections: Collection[];
  sort: string;
  direction: SortDirection;

}

export enum SortDirection {
  ASC = "asc", DESC = "desc"
}
