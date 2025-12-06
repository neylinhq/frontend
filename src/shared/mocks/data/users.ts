import type { User } from '@/entities/user'

export const mockUser: User = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'user@example.com',
  firstName: 'Max',
  lastName: 'Robinson',
  displayName: 'Max Robinson',
  username: 'maxrobinson',
  bio: 'Knowledge mapper and lifelong learner',
  role: 'user',
  avatarUrl: 'https://github.com/shadcn.png',
  preferences: {
    notifications: {
      email: true,
      marketing: false,
      updates: true
    },
    interface: {
      density: 'comfortable',
      animations: true,
      sound: false
    }
  },
  createdAt: '2024-01-15T10:30:00Z'
}

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-1234-5678-abcd-ef1234567890',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  displayName: 'Admin User',
  username: 'admin',
  role: 'admin'
}

// Mock credentials for testing
export const MOCK_CREDENTIALS = {
  email: 'user@example.com',
  password: 'password123'
}

// JWT-like tokens (not real JWTs, just for mocking)
export const generateMockTokens = () => ({
  accessToken: `mock-access-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  refreshToken: `mock-refresh-${Date.now()}-${Math.random().toString(36).slice(2)}`
})
