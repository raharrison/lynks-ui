import {EntryType} from "@shared/models";

export interface ActivityLogItem {
  id: string
  entryId: string
  src?: string
  details: string
  entryType: EntryType
  entryTitle: string
  timestamp: number
}
