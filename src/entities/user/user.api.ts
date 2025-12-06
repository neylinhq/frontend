import { api } from '@/shared/api/api-client'
import type {
  ChangeEmail,
  ChangePassword,
  UpdateProfile,
  User,
  UserPreferences
} from './user.schema'

// Response types
interface ApiResponse<T> {
  success: boolean
  data: T
}

interface MessageResponse {
  message: string
}

export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/me')
    return response.data
  },

  updateProfile: async (data: UpdateProfile): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>('/users/me', data)
    return response.data
  },

  updatePreferences: async (data: UserPreferences): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/me/preferences', data)
    return response.data
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8080/v1'}/users/me/avatar`,
      {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to upload avatar')
    }

    const result = (await response.json()) as ApiResponse<User>
    return result.data
  },

  changeEmail: async (data: ChangeEmail): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users/me/change-email', {
      newEmail: data.newEmail,
      password: data.password
    })
    return response.data
  },

  changePassword: async (data: ChangePassword): Promise<MessageResponse> => {
    const response = await api.post<ApiResponse<MessageResponse>>('/users/me/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
    return response.data
  },

  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/users/me', {
      json: { password }
    })
  }
}
