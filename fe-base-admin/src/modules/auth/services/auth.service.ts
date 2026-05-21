import { apiClient } from '@lib/api-client'
import type {
  AdminSessionsResponse,
  CurrentUser,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ForgotPasswordResponse,
  ResetPasswordDto,
} from '../types'

export const authService = {
  async login(dto: LoginDto): Promise<void> {
    await apiClient.post('/auth/login', dto, { withCredentials: true })
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {}, { withCredentials: true })
  },

  async getMe(): Promise<CurrentUser> {
    const { data } = await apiClient.get<CurrentUser>('/auth/me', { withCredentials: true })
    return data
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await apiClient.post('/auth/change-password', dto, { withCredentials: true })
  },

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    const { data } = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', dto)
    return data
  },

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    await apiClient.post('/auth/reset-password', dto)
  },

  async listAdminSessions(params: { page?: number; pageSize?: number; onlyActive?: boolean }): Promise<AdminSessionsResponse> {
    const { data } = await apiClient.get<AdminSessionsResponse>('/admin/auth/sessions', {
      params,
      withCredentials: true,
    })
    return data
  },

  async revokeAdminSession(id: string): Promise<void> {
    await apiClient.delete(`/admin/auth/sessions/${id}`, { withCredentials: true })
  },
}
