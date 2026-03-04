import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import { api } from '@/shared/api/client'

import { sessionApi } from '../session.api'

describe('sessionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls auth endpoints', async () => {
    const mockResponse = { data: { ok: true } }
    vi.mocked(api.post).mockResolvedValue(mockResponse)
    vi.mocked(api.get).mockResolvedValue(mockResponse)

    await sessionApi.getMe()
    await sessionApi.login({ email: 'user@example.com', password: 'password123' })
    await sessionApi.verifyTwoFactor({ challengeToken: 'token', code: '123456', method: 'totp' })
    await sessionApi.resendTwoFactorEmail({ challengeToken: 'token' })
    await sessionApi.register({ email: 'user@example.com', password: 'password123' })
    await sessionApi.verifyEmail({ code: '123456' })
    await sessionApi.resendVerification()
    await sessionApi.forgotPassword('user@example.com')
    await sessionApi.resetPassword({
      email: 'user@example.com',
      code: '123456',
      password: 'newpass'
    })
    await sessionApi.logout()
    await sessionApi.telegramLogin({
      id: 1,
      first_name: 'Test',
      auth_date: 123,
      hash: 'hash'
    })
    await sessionApi.getTelegramBotInfo()

    expect(api.get).toHaveBeenCalledWith('/users/me')
    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      {
        email: 'user@example.com',
        password: 'password123'
      },
      { skipAuth: true, locale: undefined }
    )
  })
})
