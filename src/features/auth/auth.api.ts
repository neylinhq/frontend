// Auth API - delegates to session API
import { sessionApi } from '@/entities/session/session.api'
import type { User } from '@/entities/user'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
}

interface AuthResponse {
  user: User
  token: string
}

// Re-export session API methods with proper types
export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> => {
    return sessionApi.login(credentials)
  },

  register: (data: RegisterData): Promise<AuthResponse> => {
    return sessionApi.register(data)
  },

  logout: (): Promise<{ success: boolean }> => {
    return sessionApi.logout()
  }
}
