export interface NewReminder {
  reminderId?: string
  entryId: string
  type: ReminderType
  notifyMethods: NotificationMethod[]
  message?: string
  spec: string
  tz: string,
  status: ReminderStatus
}

export interface Reminder {
  reminderId: string
  entryId: string
  type: ReminderType
  notifyMethods: NotificationMethod[]
  message?: string
  spec: string
  tz: string
  status: ReminderStatus
  dateCreated: number
  dateUpdated: number
}

export enum ReminderType {
  ADHOC = "adhoc",
  RECURRING = "recurring"
}

export enum ReminderStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DISABLED = "disabled"
}

export enum NotificationMethod {
  EMAIL = "email",
  WEB = "web",
  PUSHOVER = "pushover"
}

