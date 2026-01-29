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

  it('uses API_URL when uploading avatar', async () => {
    vi.resetModules()
    vi.doMock('@/shared/config/env', () => ({ API_URL: 'https://api.example.com/v1' }))
    const { userApi: userApiWithEnv } = await import('../user.api')
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'user-1' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    await userApiWithEnv.uploadAvatar(file)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/users/me/avatar',
      expect.objectContaining({ method: 'POST' })
    )

    vi.unstubAllGlobals()
    vi.doUnmock('@/shared/config/env')
    vi.resetModules()
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

  it('falls back to default error message when response JSON is invalid', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('bad json')
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(userApi.uploadAvatar(file)).rejects.toThrow('Failed to upload avatar')
    vi.unstubAllGlobals()
  })
})
