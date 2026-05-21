export interface LoginDto {
  email: string
  password: string
  type: string
  deviceName?: string
}

export interface CurrentUser {
  userId: string
  sessionId: string
  email: string
  isAdmin?: boolean
  accessibleResources?: string[]
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordDto {
  email: string
  type: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

export interface AdminSession {
  id: string
  userId: string
  userEmail: string
  userType: string
  isAdmin: boolean
  deviceName: string
  ipAddress: string
  userAgent: string
  isActive: boolean
  lastActiveAt: string
  expiresAt: string
  createdAt: string
}

export interface AdminSessionsResponse {
  data: AdminSession[]
  total: number
  page: number
  pageSize: number
}
