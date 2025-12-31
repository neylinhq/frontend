import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

import { api } from '@/shared/api/client'
import { userApi } from '../user.api'

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls user endpoints', async () => {
    const mockResponse = { data: { id: 'user-1' } }
    vi.mocked(api.get).mockResolvedValue(mockResponse)
    vi.mocked(api.patch).mockResolvedValue(mockResponse)
    vi.mocked(api.put).mockResolvedValue(mockResponse)
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } })
    vi.mocked(api.delete).mockResolvedValue(mockResponse)

    await userApi.getCurrentUser()
    await userApi.updateProfile({ displayName: 'Test' })
    await userApi.updatePreferences({
      notifications: { email: true, marketing: false, updates: true },
      interface: { density: 'comfortable', animations: true, sound: false }
    })
    await userApi.deleteAvatar()
    await userApi.changeEmail({ newEmail: 'new@example.com', password: 'pass' })
    await userApi.changePassword({
      currentPassword: 'old',
      newPassword: 'newpass',
      confirmPassword: 'newpass'
    })
    await userApi.deleteAccount('pass')

    expect(api.get).toHaveBeenCalledWith('/users/me', { cookies: undefined })
    expect(api.patch).toHaveBeenCalledWith('/users/me', { displayName: 'Test' })
  })

  it('uploads avatar with fetch', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'user-1' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await userApi.uploadAvatar(file)
    expect(fetchMock).toHaveBeenCalled()
    expect(result).toEqual({ id: 'user-1' })

    vi.unstubAllGlobals()
  })

  it('throws on avatar upload error', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Failed' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(userApi.uploadAvatar(file)).rejects.toThrow('Failed')
    vi.unstubAllGlobals()
  })
})
