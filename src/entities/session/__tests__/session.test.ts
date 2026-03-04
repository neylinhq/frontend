import { describe, expect, it } from 'vitest'

import { isTwoFactorRequired } from '../session.api'

describe('isTwoFactorRequired', () => {
  it('returns true for 2FA challenge payload', () => {
    const result = isTwoFactorRequired({
      requiresTwoFactor: true,
      challengeToken: 'token-123',
      twoFactorMethods: ['totp']
    })

    expect(result).toBe(true)
  })

  it('returns false for user data', () => {
    const result = isTwoFactorRequired({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com'
    })

    expect(result).toBe(false)
  })
})
