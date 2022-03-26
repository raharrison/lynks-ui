import {EntryType} from "@shared/models";

export interface Notification {
  id: string,
  type: NotificationType,
  message: string,
  read: boolean,
  entryId?: string,
  entryType?: EntryType,
  entryTitle?: string,
  dateCreated: number
}

export enum NotificationType {
  PROCESSED = "processed",
  ERROR = "error",
  REMINDER = "reminder",
  DISCUSSIONS = "discussions"
}
