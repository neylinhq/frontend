import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../user.api', () => ({
  userApi: {
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn()
  }
}))

import { userApi } from '../user.api'
import {
  useChangeEmail,
  useChangePassword,
  useCurrentUser,
  useDeleteAccount,
  useDeleteAvatar,
  userKeys,
  useUpdatePreferences,
  useUpdateProfile,
  useUploadAvatar
} from '../user.queries'

describe('user queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  const user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    preferences: {
      notifications: { email: true, marketing: false, updates: true },
      interface: { density: 'comfortable', animations: true, sound: false }
    }
  }

  it('fetches current user', async () => {
    vi.mocked(userApi.getCurrentUser).mockResolvedValue(user)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(user))
    expect(userApi.getCurrentUser).toHaveBeenCalled()
  })

  it('uses initial data without refetch', async () => {
    vi.mocked(userApi.getCurrentUser).mockResolvedValue(user)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useCurrentUser(user), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(user))
    expect(userApi.getCurrentUser).not.toHaveBeenCalled()
  })

  it('updates profile and preferences', async () => {
    vi.mocked(userApi.updateProfile).mockResolvedValue({ ...user, displayName: 'New' })
    vi.mocked(userApi.updatePreferences).mockResolvedValue({
      notifications: { email: false, marketing: false, updates: true },
      interface: { density: 'compact', animations: false, sound: true }
    })

    const queryClient = createTestQueryClient()
    queryClient.setQueryData(userKeys.current(), user)
    const wrapper = createQueryWrapper(queryClient)

    const { result: updateProfile } = renderHook(() => useUpdateProfile(), { wrapper })
    await act(async () => {
      await updateProfile.current.mutateAsync({ displayName: 'New' })
    })

    const { result: updatePreferences } = renderHook(() => useUpdatePreferences(), { wrapper })
    await act(async () => {
      await updatePreferences.current.mutateAsync({
        notifications: { email: false, marketing: false, updates: true },
        interface: { density: 'compact', animations: false, sound: true }
      })
    })

    expect(queryClient.getQueryData(userKeys.current())).toEqual({
      ...user,
      displayName: 'New',
      preferences: {
        notifications: { email: false, marketing: false, updates: true },
        interface: { density: 'compact', animations: false, sound: true }
      }
    })
  })

  it('keeps undefined user data when updating preferences without cache', async () => {
    vi.mocked(userApi.updatePreferences).mockResolvedValue({
      notifications: { email: false, marketing: false, updates: false },
      interface: { density: 'compact', animations: false, sound: false }
    })

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useUpdatePreferences(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({
        notifications: { email: false, marketing: false, updates: false },
        interface: { density: 'compact', animations: false, sound: false }
      })
    })

    expect(queryClient.getQueryData(userKeys.current())).toBeUndefined()
  })

  it('updates avatar and invalidates email change', async () => {
    vi.mocked(userApi.uploadAvatar).mockResolvedValue({ ...user, avatarUrl: 'url' })
    vi.mocked(userApi.deleteAvatar).mockResolvedValue(user)
    vi.mocked(userApi.changeEmail).mockResolvedValue({ message: 'ok' })
    vi.mocked(userApi.changePassword).mockResolvedValue({ message: 'ok' })
    vi.mocked(userApi.deleteAccount).mockResolvedValue(undefined)

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: upload } = renderHook(() => useUploadAvatar(), { wrapper })
    await act(async () => {
      await upload.current.mutateAsync(new File(['avatar'], 'avatar.png', { type: 'image/png' }))
    })

    const { result: remove } = renderHook(() => useDeleteAvatar(), { wrapper })
    await act(async () => {
      await remove.current.mutateAsync()
    })

    const { result: changeEmail } = renderHook(() => useChangeEmail(), { wrapper })
    await act(async () => {
      await changeEmail.current.mutateAsync({ newEmail: 'new@example.com', password: 'pass' })
    })

    const { result: changePassword } = renderHook(() => useChangePassword(), { wrapper })
    await act(async () => {
      await changePassword.current.mutateAsync({
        currentPassword: 'old',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword'
      })
    })

    const { result: deleteAccount } = renderHook(() => useDeleteAccount(), { wrapper })
    await act(async () => {
      await deleteAccount.current.mutateAsync('pass')
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userKeys.current() })
    expect(userApi.deleteAccount).toHaveBeenCalledWith('pass')
  })
})
