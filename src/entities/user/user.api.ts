import { API_DELAYS, delay } from '@/shared/config/api-delays'
import { generateAvatarUrl } from '@/shared/config/api-endpoints'
import { MOCK_CREDENTIALS } from '@/shared/config/mock'
import type {
  ChangeEmail,
  ChangePassword,
  UpdateProfile,
  User,
  UserPreferences
} from './user.schema'
import { defaultUserPreferences } from './user.schema'

// Mock user for development
const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: MOCK_CREDENTIALS.EMAIL,
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  avatarUrl: undefined,
  createdAt: new Date().toISOString(),
  displayName: 'John Doe',
  username: 'johndoe',
  bio: '',
  preferences: defaultUserPreferences
}

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    await delay(API_DELAYS.USER_GET_CURRENT)
    return { ...mockUser }
  },

  updateProfile: async (data: UpdateProfile): Promise<User> => {
    await delay(API_DELAYS.USER_UPDATE_PROFILE)
    Object.assign(mockUser, data)
    return { ...mockUser }
  },

  updatePreferences: async (data: UserPreferences): Promise<UserPreferences> => {
    await delay(API_DELAYS.USER_UPDATE_PREFERENCES)
    mockUser.preferences = data
    return data
  },

  uploadAvatar: async (_file: File): Promise<{ avatarUrl: string }> => {
    await delay(API_DELAYS.USER_UPLOAD_AVATAR)
    // In real app, this would upload to S3/Cloudinary and return URL
    const avatarUrl = generateAvatarUrl(Date.now())
    mockUser.avatarUrl = avatarUrl
    return { avatarUrl }
  },

  changeEmail: async (data: ChangeEmail): Promise<void> => {
    await delay(API_DELAYS.USER_CHANGE_EMAIL)
    // In real app, this would send verification email
    if (data.password !== MOCK_CREDENTIALS.PASSWORD) {
      throw new Error('Invalid password')
    }
    mockUser.email = data.newEmail
  },

  changePassword: async (data: ChangePassword): Promise<void> => {
    await delay(API_DELAYS.USER_CHANGE_PASSWORD)
    // In real app, this would verify current password and update
    if (data.currentPassword !== MOCK_CREDENTIALS.PASSWORD) {
      throw new Error('Invalid current password')
    }
    // Password updated successfully (mock)
  },

  deleteAccount: async (password: string): Promise<void> => {
    await delay(API_DELAYS.USER_DELETE_ACCOUNT)
    if (password !== MOCK_CREDENTIALS.PASSWORD) {
      throw new Error('Invalid password')
    }
    // Account deleted (mock)
  }
}
