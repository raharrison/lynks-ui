export interface User {
  username: string
  password?: string
  email?: string
  digest?: boolean
  displayName?: string
  dateCreated: number
  dateUpdated: number
}
