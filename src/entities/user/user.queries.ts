import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from './user.api'
import type { UpdateProfile, UserPreferences, ChangeEmail, ChangePassword } from './user.schema'

export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userApi.getCurrentUser,
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfile) => userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.current(), updatedUser)
    },
  })
}

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserPreferences) => userApi.updatePreferences(data),
    onSuccess: (preferences) => {
      queryClient.setQueryData(userKeys.current(), (old: any) => ({
        ...old,
        preferences,
      }))
    },
  })
}

export const useUploadAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: ({ avatarUrl }) => {
      queryClient.setQueryData(userKeys.current(), (old: any) => ({
        ...old,
        avatarUrl,
      }))
    },
  })
}

export const useChangeEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChangeEmail) => userApi.changeEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() })
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePassword) => userApi.changePassword(data),
  })
}

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: (password: string) => userApi.deleteAccount(password),
  })
}
