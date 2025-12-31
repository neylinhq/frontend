import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

import { api } from '@/shared/api/client'
import { subscriptionApi } from '../subscription.api'

describe('subscriptionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls subscription endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [], meta: { total: 0 } })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    vi.mocked(api.patch).mockResolvedValue({ data: {} })
    vi.mocked(api.delete).mockResolvedValue({})

    await subscriptionApi.getCurrentSubscription()
    await subscriptionApi.getUsageStats()
    await subscriptionApi.getPlans()
    await subscriptionApi.getPlanDetails('pro')
    await subscriptionApi.createCheckoutSession('pro')
    await subscriptionApi.cancelSubscription()
    await subscriptionApi.resumeSubscription()
    await subscriptionApi.updateSubscription('free')
    await subscriptionApi.getPaymentMethods()
    await subscriptionApi.addPaymentMethod({
      type: 'card',
      cardholderName: 'Test User',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 1,
      expiryYear: 2030
    })
    await subscriptionApi.addCryptoPaymentMethod({
      walletAddress: '0xabc',
      network: 'ethereum',
      currency: 'USDT'
    })
    await subscriptionApi.removePaymentMethod('pm-1')
    await subscriptionApi.setDefaultPaymentMethod('pm-1')
    await subscriptionApi.updatePaymentMethod({ id: 'pm-1', expiryMonth: 2, expiryYear: 2031 })
    await subscriptionApi.getPaymentHistory(10, 5)
    await subscriptionApi.createBillingPortalSession()
    await subscriptionApi.subscribeWithCrypto({ planType: 'pro', paymentMethodId: 'pm-1' })

    expect(api.get).toHaveBeenCalledWith('/subscriptions/current')
    expect(api.post).toHaveBeenCalledWith('/subscriptions/checkout', { planType: 'pro' })
  })

  it('returns payment history with total from meta', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: 'ph-1' }],
      meta: { total: 4 }
    })

    const result = await subscriptionApi.getPaymentHistory(1, 0)
    expect(result).toEqual({ history: [{ id: 'ph-1' }], total: 4 })
  })
})