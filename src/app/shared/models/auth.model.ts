export interface AuthRequest {
  username: string
  password: string
}

export interface ChangePasswordRequest {
  username: string
  oldPassword: string
  newPassword: string
}
