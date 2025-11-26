import type { User, UserPreferences, UpdateProfile, ChangeEmail, ChangePassword } from './user.schema'
import { defaultUserPreferences } from './user.schema'

// Mock user for development
const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  avatarUrl: undefined,
  createdAt: new Date().toISOString(),
  displayName: 'John Doe',
  username: 'johndoe',
  bio: '',
  preferences: defaultUserPreferences,
}

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    await delay(100)
    return { ...mockUser }
  },

  updateProfile: async (data: UpdateProfile): Promise<User> => {
    await delay(300)
    Object.assign(mockUser, data)
    return { ...mockUser }
  },

  updatePreferences: async (data: UserPreferences): Promise<UserPreferences> => {
    await delay(200)
    mockUser.preferences = data
    return data
  },

  uploadAvatar: async (_file: File): Promise<{ avatarUrl: string }> => {
    await delay(500)
    // In real app, this would upload to S3/Cloudinary and return URL
    const avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
    mockUser.avatarUrl = avatarUrl
    return { avatarUrl }
  },

  changeEmail: async (data: ChangeEmail): Promise<void> => {
    await delay(400)
    // In real app, this would send verification email
    if (data.password !== 'password') {
      throw new Error('Invalid password')
    }
    mockUser.email = data.newEmail
  },

  changePassword: async (data: ChangePassword): Promise<void> => {
    await delay(400)
    // In real app, this would verify current password and update
    if (data.currentPassword !== 'password') {
      throw new Error('Invalid current password')
    }
    // Password updated successfully (mock)
  },

  deleteAccount: async (password: string): Promise<void> => {
    await delay(500)
    if (password !== 'password') {
      throw new Error('Invalid password')
    }
    // Account deleted (mock)
  },
}
