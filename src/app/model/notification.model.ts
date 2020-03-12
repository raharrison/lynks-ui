export interface Notification {
  entity: string,
  type: NotificationType,
  message: string,
  body: any
}

export enum NotificationType {
  EXECUTED = "EXECUTED",
  ERROR = "ERROR",
  REMINDER = "REMINDER",
  DISCUSSIONS = "DISCUSSIONS"
}
