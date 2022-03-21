export interface NewReminder {
  reminderId?: string
  entryId: string
  type: ReminderType
  notifyMethods: NotificationMethod[]
  message?: string
  spec: string
  tz: string
}

export interface Reminder {
  reminderId: string
  entryId: string
  type: ReminderType
  notifyMethods: NotificationMethod[]
  message?: string
  spec: string
  tz: string
  dateCreated: number
  dateUpdated: number
}

export enum ReminderType {
  ADHOC = "adhoc",
  RECURRING = "recurring"
}

export enum NotificationMethod {
  EMAIL = "email",
  WEB = "web",
  PUSHOVER = "pushover"
}

