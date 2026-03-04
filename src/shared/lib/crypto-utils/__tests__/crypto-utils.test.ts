import { describe, expect, it } from 'vitest'

import { shortenWalletAddress } from '..'

describe('shortenWalletAddress', () => {
  it('shortens long addresses', () => {
    expect(shortenWalletAddress('0x1234567890abcdef')).toBe('0x1234...cdef')
  })

  it('returns short addresses as-is', () => {
    expect(shortenWalletAddress('0x1234')).toBe('0x1234')
  })
})
