import type { User } from '@/entities/user'
import { api, setAuthToken, setRefreshToken, getRefreshToken } from '@/shared/api/api-client'

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
  }
}

interface MessageResponse {
  success: boolean
  data: {
    message: string
  }
}

interface RefreshResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
  }
}

export const sessionApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data, { skipAuth: true })
    setAuthToken(response.data.accessToken)
    setRefreshToken(response.data.refreshToken)
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    }
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data, { skipAuth: true })
    setAuthToken(response.data.accessToken)
    setRefreshToken(response.data.refreshToken)
    return {
      user: response.data.user,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<MessageResponse>(
      '/auth/forgot-password',
      { email },
      { skipAuth: true }
    )
    return response.data
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post<MessageResponse>(
      '/auth/reset-password',
      { token, password },
      { skipAuth: true }
    )
    return response.data
  },

  refresh: async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post<RefreshResponse>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    )
    setAuthToken(response.data.accessToken)
    setRefreshToken(response.data.refreshToken)
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {})
    } finally {
      setAuthToken(null)
      setRefreshToken(null)
    }
  }
}
