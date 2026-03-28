import { api, type ApiResponse } from '@/shared/api/client'
import { API_URL } from '@/shared/config/env'

import type {
  ChangeEmail,
  ChangePassword,
  UpdateProfile,
  User,
  UserPreferences
} from './user.schema'

interface MessageResponse {
  message: string
}

export const userApi = {
  getCurrentUser: async (options?: { cookies?: string }): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/me', { cookies: options?.cookies })
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

    const response = await fetch(`${API_URL}/users/me/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to upload avatar')
    }

    const result = (await response.json()) as ApiResponse<User>
    return result.data
  },

  deleteAvatar: async (): Promise<User> => {
    const response = await api.delete<ApiResponse<User>>('/users/me/avatar')
    return response.data
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
