export interface NewReminder {
  reminderId?: string
  entryId: string
  type: ReminderType
  notifyMethod: NotificationMethod
  message?: string
  spec: string
  tz: string
}

export interface Reminder {
  reminderId: string
  entryId: string
  type: ReminderType
  notifyMethod: NotificationMethod
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
  PUSH = "push",
  BOTH = "both"
}

