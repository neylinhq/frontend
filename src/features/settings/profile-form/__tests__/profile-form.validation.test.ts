import { describe, expect, it } from 'vitest'

import { profileFormSchema } from '../lib/validation'

describe('profileFormSchema', () => {
  it('accepts an empty username', () => {
    const result = profileFormSchema.parse({ username: '' })
    expect(result.username).toBe('')
  })

  it('rejects usernames with spaces', () => {
    expect(() => profileFormSchema.parse({ username: 'not valid' })).toThrow()
  })
})
