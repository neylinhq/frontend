import type { User } from '@/entities/user'
import { api } from '@/shared/api/api-client'

// Types
interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
    message?: string
  }
}

interface MessageResponse {
  success: boolean
  data: {
    message: string
  }
}

interface VerifyEmailRequest {
  code: string
}

interface ResetPasswordRequest {
  email: string
  code: string
  password: string
}

export const sessionApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data, { skipAuth: true })
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    }
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data, { skipAuth: true })
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      message: response.data.message
    }
  },

  verifyEmail: async (data: VerifyEmailRequest) => {
    const response = await api.post<MessageResponse>('/auth/verify-email', data, { skipAuth: true })
    return response.data
  },

  resendVerification: async () => {
    const response = await api.post<MessageResponse>('/auth/resend-verification', {})
    return response.data
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<MessageResponse>(
      '/auth/forgot-password',
      { email },
      { skipAuth: true }
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post<MessageResponse>(
      '/auth/reset-password',
      data,
      { skipAuth: true }
    )
    return response.data
  },

  logout: async () => {
    await api.post('/auth/logout', {})
  }
}
