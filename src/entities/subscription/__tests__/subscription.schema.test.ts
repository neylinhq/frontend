import { describe, expect, it } from 'vitest'
import {
  PaymentMethodSchema,
  PlanTypeEnum,
  SubscriptionSchema
} from '../subscription.schema'

describe('SubscriptionSchema', () => {
  it('parses a valid subscription', () => {
    const subscription = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '223e4567-e89b-12d3-a456-426614174000',
      planType: 'pro',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00.000Z',
      currentPeriodEnd: '2024-02-01T00:00:00.000Z',
      cancelAtPeriodEnd: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    }

    expect(SubscriptionSchema.parse(subscription)).toEqual(subscription)
  })
})

describe('PlanTypeEnum', () => {
  it('rejects invalid plan types', () => {
    expect(() => PlanTypeEnum.parse('enterprise')).toThrow()
  })
})

describe('PaymentMethodSchema', () => {
  it('parses a card payment method', () => {
    const card = {
      id: '323e4567-e89b-12d3-a456-426614174000',
      isDefault: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2030
    }

    expect(PaymentMethodSchema.parse(card)).toEqual(card)
  })

  it('parses a crypto payment method', () => {
    const crypto = {
      id: '423e4567-e89b-12d3-a456-426614174000',
      isDefault: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      type: 'crypto',
      walletAddress: '0xabc',
      network: 'tron',
      currency: 'USDT'
    }

    expect(PaymentMethodSchema.parse(crypto)).toEqual(crypto)
  })
})
