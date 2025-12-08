import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userApi } from './user.api'
import type {
  ChangeEmail,
  ChangePassword,
  UpdateProfile,
  User,
  UserPreferences
} from './user.schema'

export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const
}

export const useCurrentUser = (initialData?: User) => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userApi.getCurrentUser,
    initialData,
    staleTime: 1000 * 60 * 5 // 5 minutes - don't refetch immediately if we have initial data
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfile) => userApi.updateProfile(data),
    onSuccess: updatedUser => {
      queryClient.setQueryData(userKeys.current(), updatedUser)
    }
  })
}

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserPreferences) => userApi.updatePreferences(data),
    onSuccess: preferences => {
      queryClient.setQueryData<User>(userKeys.current(), old => {
        if (!old) {
          return old
        }
        return {
          ...old,
          preferences
        }
      })
    }
  })
}

export const useUploadAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: updatedUser => {
      queryClient.setQueryData<User>(userKeys.current(), updatedUser)
    }
  })
}

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => userApi.deleteAvatar(),
    onSuccess: updatedUser => {
      queryClient.setQueryData<User>(userKeys.current(), updatedUser)
    }
  })
}

export const useChangeEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ChangeEmail) => userApi.changeEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() })
    }
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePassword) => userApi.changePassword(data)
  })
}

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: (password: string) => userApi.deleteAccount(password)
  })
}
