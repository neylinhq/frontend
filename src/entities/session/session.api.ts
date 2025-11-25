import type { User } from '@/entities/user'

// Mocks
const MOCK_USER: User = {
  id: '1',
  email: 'm@example.com',
  firstName: 'Max',
  lastName: 'Robinson',
  role: 'user',
  createdAt: new Date().toISOString()
}

export const sessionApi = {
  login: async (_data: unknown) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { user: MOCK_USER, token: 'mock-jwt-token' }
  },

  register: async (_data: unknown) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { user: MOCK_USER, token: 'mock-jwt-token' }
  },

  resetPassword: async (_email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true }
  }
}
