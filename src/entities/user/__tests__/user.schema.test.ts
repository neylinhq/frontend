import { describe, expect, it } from 'vitest'
import { ChangePasswordSchema, UserPreferencesSchema, UserSchema } from '../user.schema'

describe('UserSchema', () => {
  it('parses a minimal user', () => {
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      createdAt: '2024-01-15T00:00:00.000Z'
    }

    const result = UserSchema.parse(user)
    expect(result).toMatchObject(user)
  })

  it('rejects an invalid email', () => {
    expect(() =>
      UserSchema.parse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'not-an-email',
        createdAt: '2024-01-15T00:00:00.000Z'
      })
    ).toThrow()
  })
})

describe('UserPreferencesSchema', () => {
  it('fills defaults for nested preferences', () => {
    const result = UserPreferencesSchema.parse({ notifications: {}, interface: {} })

    expect(result.notifications).toEqual({
      email: true,
      marketing: false,
      updates: true
    })
    expect(result.interface).toEqual({
      density: 'comfortable',
      animations: true,
      sound: false
    })
  })
})

describe('ChangePasswordSchema', () => {
  it('rejects mismatched confirmation', () => {
    expect(() =>
      ChangePasswordSchema.parse({
        currentPassword: 'old-pass',
        newPassword: 'new-password',
        confirmPassword: 'different'
      })
    ).toThrow()
  })
})
