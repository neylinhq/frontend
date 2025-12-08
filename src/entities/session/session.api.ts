import type { User } from '@/entities/user'
import { api } from '@/shared/api/client'

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

interface UserResponse {
  success: boolean
  data: User
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

// Options for server-side requests
interface RequestOptions {
  locale?: string
}

export const sessionApi = {
  getMe: async () => {
    const response = await api.get<UserResponse>('/users/me')
    return response.data
  },

  login: async (data: LoginRequest, options?: RequestOptions) => {
    const response = await api.post<UserResponse>('/auth/login', data, { skipAuth: true, locale: options?.locale })
    return response.data // Returns User directly
  },

  register: async (data: RegisterRequest, options?: RequestOptions) => {
    const response = await api.post<UserResponse>('/auth/register', data, { skipAuth: true, locale: options?.locale })
    return response.data // Returns User directly
  },

  verifyEmail: async (data: VerifyEmailRequest, options?: RequestOptions) => {
    const response = await api.post<MessageResponse>('/auth/verify-email', data, { skipAuth: true, locale: options?.locale })
    return response.data
  },

  resendVerification: async (options?: RequestOptions) => {
    const response = await api.post<MessageResponse>('/auth/resend-verification', {}, { locale: options?.locale })
    return response.data
  },

  forgotPassword: async (email: string, options?: RequestOptions) => {
    const response = await api.post<MessageResponse>(
      '/auth/forgot-password',
      { email },
      { skipAuth: true, locale: options?.locale }
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest, options?: RequestOptions) => {
    const response = await api.post<MessageResponse>(
      '/auth/reset-password',
      data,
      { skipAuth: true, locale: options?.locale }
    )
    return response.data
  },

  logout: async () => {
    await api.post('/auth/logout', {})
  }
}
