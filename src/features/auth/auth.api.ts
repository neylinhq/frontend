// Auth API - stub implementation
// TODO: Replace with actual API calls

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

export const authApi = {
  login: async (_credentials: LoginCredentials): Promise<AuthResponse> => {
    // Stub - replace with actual API call
    throw new Error('Login not implemented')
  },

  register: async (_data: RegisterData): Promise<AuthResponse> => {
    // Stub - replace with actual API call
    throw new Error('Register not implemented')
  },

  logout: async (): Promise<void> => {
    // Stub - replace with actual API call
  },
}
