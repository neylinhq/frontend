import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import { api } from '@/shared/api/client'
import { twoFactorApi } from '../two-factor.api'

describe('twoFactorApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls 2fa endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    vi.mocked(api.post).mockResolvedValue({ data: {} })

    await twoFactorApi.getStatus()
    await twoFactorApi.setupTOTP()
    await twoFactorApi.enableTOTP('123456')
    await twoFactorApi.enableEmailOTP()
    await twoFactorApi.disable('123456', 'password')
    await twoFactorApi.regenerateBackupCodes('123456')
    await twoFactorApi.sendEmailCode()

    expect(api.get).toHaveBeenCalledWith('/2fa/status', { cookies: undefined })
    expect(api.post).toHaveBeenCalledWith('/2fa/totp/enable', { code: '123456' })
  })
})