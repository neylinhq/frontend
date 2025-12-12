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

// Login response can be either:
// 1. User data (no 2FA) - standard login
// 2. 2FA challenge (2FA enabled) - need verification
interface LoginResponse {
  success: boolean
  data: User | TwoFactorChallengeData
}

export interface TwoFactorChallengeData {
  requiresTwoFactor: true
  challengeToken: string
  twoFactorMethods: ('totp' | 'email' | 'backup')[]
}

// Type guard to check if login response requires 2FA
export function isTwoFactorRequired(data: User | TwoFactorChallengeData): data is TwoFactorChallengeData {
  return 'requiresTwoFactor' in data && data.requiresTwoFactor === true
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

// 2FA Types
export interface VerifyTwoFactorRequest {
  challengeToken: string
  code: string
  method: 'totp' | 'email' | 'backup'
}

interface ResendTwoFactorEmailRequest {
  challengeToken: string
}

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramLoginResponse {
  success: boolean
  data: {
    user: User
    is_new_user: boolean
  }
}

interface TelegramBotInfoResponse {
  success: boolean
  data: {
    bot_username: string
    bot_id: string
  }
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
    const response = await api.post<LoginResponse>('/auth/login', data, { skipAuth: true, locale: options?.locale })
    return response.data // Returns User or TwoFactorChallengeData
  },

  verifyTwoFactor: async (data: VerifyTwoFactorRequest, options?: RequestOptions) => {
    const response = await api.post<UserResponse>('/auth/verify-2fa', data, { skipAuth: true, locale: options?.locale })
    return response.data // Returns User after successful 2FA
  },

  resendTwoFactorEmail: async (data: ResendTwoFactorEmailRequest, options?: RequestOptions) => {
    const response = await api.post<MessageResponse>('/auth/resend-2fa-email', data, { skipAuth: true, locale: options?.locale })
    return response.data
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
  },

  telegramLogin: async (data: TelegramAuthData) => {
    const response = await api.post<TelegramLoginResponse>('/oauth/telegram/login', data, { skipAuth: true })
    return response.data
  },

  getTelegramBotInfo: async () => {
    const response = await api.get<TelegramBotInfoResponse>('/oauth/telegram/info', { skipAuth: true })
    return response.data
  }
}
