import { describe, expect, it } from 'vitest'
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isValidExpiry,
  isValidLuhn,
  maskCardNumber,
  parseExpiry
} from '..'

describe('card-utils', () => {
  it('detects known card brands', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa')
    expect(detectCardBrand('378282246310005')).toBe('amex')
  })

  it('returns unknown for unsupported prefixes', () => {
    expect(detectCardBrand('0000000000000000')).toBe('unknown')
  })

  it('validates card numbers with Luhn', () => {
    expect(isValidLuhn('4111111111111111')).toBe(true)
    expect(isValidLuhn('4111111111111112')).toBe(false)
  })

  it('formats card numbers with gaps', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111')
  })

  it('formats expiry with auto-prefix', () => {
    expect(formatExpiry('3')).toBe('03/')
    expect(formatExpiry('1225')).toBe('12/25')
  })

  it('parses expiry into month and year', () => {
    expect(parseExpiry('12/99')).toEqual({ month: '12', year: '2099' })
    expect(parseExpiry('1299')).toBeNull()
  })

  it('validates expiry dates', () => {
    expect(isValidExpiry('12/99')).toBe(true)
    expect(isValidExpiry('13/20')).toBe(false)
  })

  it('masks card numbers', () => {
    expect(maskCardNumber('4111111111111111')).toMatch(/1111$/)
    expect(maskCardNumber('12')).toBe('12')
  })
})
