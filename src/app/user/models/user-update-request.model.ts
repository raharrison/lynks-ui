export interface UserUpdateRequest {
  username: string
  email?: string
  displayName?: string
  digest?: boolean
}
