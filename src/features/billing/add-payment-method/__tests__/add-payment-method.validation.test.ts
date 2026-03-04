import { describe, expect, it } from 'vitest'

import { addPaymentMethodSchema } from '../lib/validation'

describe('addPaymentMethodSchema', () => {
  it('accepts valid card details', () => {
    const payload = {
      cardholderName: 'Jane Doe',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/99',
      cvc: '123'
    }

    expect(addPaymentMethodSchema.parse(payload)).toEqual(payload)
  })

  it('rejects invalid card numbers', () => {
    expect(() =>
      addPaymentMethodSchema.parse({
        cardholderName: 'Jane Doe',
        cardNumber: '4242 4242 4242 4243',
        expiry: '12/99',
        cvc: '123'
      })
    ).toThrow()
  })

  it('rejects invalid expiry dates', () => {
    expect(() =>
      addPaymentMethodSchema.parse({
        cardholderName: 'Jane Doe',
        cardNumber: '4242 4242 4242 4242',
        expiry: '00/00',
        cvc: '123'
      })
    ).toThrow()
  })

  it('validates CVC length for different brands', () => {
    const amex = {
      cardholderName: 'Jane Doe',
      cardNumber: '378282246310005',
      expiry: '12/99'
    }

    expect(addPaymentMethodSchema.parse({ ...amex, cvc: '1234' }).cvc).toBe('1234')
    expect(addPaymentMethodSchema.parse({ ...amex, cvc: '123' }).cvc).toBe('123')
  })
})
