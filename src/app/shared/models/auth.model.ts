export interface AuthRequest {
  username: string
  password: string
  totp?: string
}

export enum AuthResult {
  SUCCESS = "success",
  TOTP_REQUIRED = "totp_required",
  INVALID_CREDENTIALS = "invalid_credentials"
}
