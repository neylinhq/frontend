import type { User } from '@/entities/user'
import { API_DELAYS, delay } from '@/shared/config/api-delays'
import { API_ENDPOINTS } from '@/shared/config/api-endpoints'

// Mocks
const MOCK_USER: User = {
  id: '1',
  email: 'm@example.com',
  firstName: 'Max',
  lastName: 'Robinson',
  role: 'user',
  avatarUrl: API_ENDPOINTS.GITHUB_AVATAR,
  createdAt: new Date().toISOString()
}

export const sessionApi = {
  login: async (_data: unknown) => {
    await delay(API_DELAYS.SESSION_LOGIN)
    return { user: MOCK_USER, token: 'mock-jwt-token' }
  },

  register: async (_data: unknown) => {
    await delay(API_DELAYS.SESSION_REGISTER)
    return { user: MOCK_USER, token: 'mock-jwt-token' }
  },

  resetPassword: async (_email: string) => {
    await delay(API_DELAYS.SESSION_RESET_PASSWORD)
    return { success: true }
  },

  logout: async () => {
    await delay(API_DELAYS.SESSION_LOGOUT)
    return { success: true }
  }
}
