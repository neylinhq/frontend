import { describe, expect, it } from 'vitest'
import { deleteAccountSchema, emailChangeSchema, passwordChangeSchema } from '../lib/validation'

describe('security form validation', () => {
  it('rejects invalid email change payloads', () => {
    expect(() => emailChangeSchema.parse({ newEmail: 'bad', password: '' })).toThrow()
  })

  it('rejects mismatched passwords', () => {
    expect(() =>
      passwordChangeSchema.parse({
        currentPassword: 'old',
        newPassword: 'newpassword',
        confirmPassword: 'different'
      })
    ).toThrow()
  })

  it('requires delete confirmation phrase', () => {
    expect(() =>
      deleteAccountSchema.parse({ password: 'pass', confirmation: 'DELETE ME' })
    ).toThrow()
  })
})
