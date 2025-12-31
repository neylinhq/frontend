import { describe, expect, it } from 'vitest'
import { CARD_VALIDATION, getCvcLength, getCvcPlaceholder } from '../lib/card-validation'

describe('card validation helpers', () => {
  it('returns CVC length by card brand', () => {
    expect(getCvcLength('amex')).toBe(CARD_VALIDATION.CVC_LENGTH_AMEX)
    expect(getCvcLength('visa')).toBe(CARD_VALIDATION.CVC_LENGTH_OTHER)
  })

  it('returns placeholder by card brand', () => {
    expect(getCvcPlaceholder('amex')).toBe('XXXX')
    expect(getCvcPlaceholder('visa')).toBe('XXX')
  })
})
