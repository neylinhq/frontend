import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../subscription.api', () => ({
  subscriptionApi: {
    getCurrentSubscription: vi.fn(),
    getUsageStats: vi.fn(),
    getPlans: vi.fn(),
    getPlanDetails: vi.fn(),
    getPaymentMethods: vi.fn(),
    getPaymentHistory: vi.fn(),
    updateSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    resumeSubscription: vi.fn(),
    addPaymentMethod: vi.fn(),
    addCryptoPaymentMethod: vi.fn(),
    removePaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn(),
    updatePaymentMethod: vi.fn(),
    createCheckoutSession: vi.fn(),
    createBillingPortalSession: vi.fn(),
    subscribeWithCrypto: vi.fn()
  }
}))

import type { PlanType } from '../subscription.schema'
import { subscriptionApi } from '../subscription.api'
import {
  subscriptionKeys,
  useAddCryptoPaymentMethod,
  useAddPaymentMethod,
  useCancelSubscription,
  useCreateBillingPortalSession,
  useCreateCheckoutSession,
  usePaymentHistory,
  usePaymentMethods,
  usePlanDetails,
  usePlans,
  useRemovePaymentMethod,
  useResumeSubscription,
  useSetDefaultPaymentMethod,
  useSubscribeWithCrypto,
  useSubscription,
  useUpdatePaymentMethod,
  useUpdateSubscription,
  useUsageStats
} from '../subscription.queries'

describe('subscription queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  const subscription = {
    id: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000002',
    planType: 'pro',
    status: 'active',
    currentPeriodStart: '2024-01-01T00:00:00.000Z',
    currentPeriodEnd: '2024-02-01T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const usage = {
    mapsCount: 1,
    tokensUsedThisMonth: 10,
    aiRequestsThisMonth: 0,
    storageUsedMB: 5
  }

  const plan = {
    type: 'pro',
    name: 'Pro',
    description: 'Plan',
    price: 1000,
    currency: 'USD',
    interval: 'month',
    limits: {
      maxMaps: 10,
      maxNodesPerMap: 100,
      tokensPerMonth: 1000,
      allowedTiers: ['pro'],
      aiModels: ['model'],
      aiRequestsPerMonth: 100
    },
    features: ['feature']
  }

  const paymentMethods = [
    {
      id: 'pm-card',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 1,
      expiryYear: 2030,
      isDefault: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'pm-crypto',
      type: 'crypto',
      walletAddress: '0xabc',
      network: 'ethereum',
      currency: 'USDT',
      isDefault: false,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ]

  const history = [{
    id: 'ph-1',
    amount: 1000,
    currency: 'USD',
    status: 'succeeded',
    description: 'Payment',
    createdAt: '2024-01-01T00:00:00.000Z'
  }]

  it('fetches subscription data', async () => {
    vi.mocked(subscriptionApi.getCurrentSubscription).mockResolvedValue(subscription)
    vi.mocked(subscriptionApi.getUsageStats).mockResolvedValue(usage)
    vi.mocked(subscriptionApi.getPlans).mockResolvedValue([plan])
    vi.mocked(subscriptionApi.getPlanDetails).mockResolvedValue(plan)
    vi.mocked(subscriptionApi.getPaymentMethods).mockResolvedValue(paymentMethods)
    vi.mocked(subscriptionApi.getPaymentHistory).mockResolvedValue({ history, total: 1 })

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result: subResult } = renderHook(() => useSubscription(), { wrapper })
    await waitFor(() => expect(subResult.current.data).toEqual(subscription))

    const { result: usageResult } = renderHook(() => useUsageStats(), { wrapper })
    await waitFor(() => expect(usageResult.current.data).toEqual(usage))

    const { result: plansResult } = renderHook(() => usePlans(), { wrapper })
    await waitFor(() => expect(plansResult.current.data).toEqual([plan]))

    const { result: planResult } = renderHook(() => usePlanDetails('pro'), { wrapper })
    await waitFor(() => expect(planResult.current.data).toEqual(plan))

    const { result: methodsResult } = renderHook(() => usePaymentMethods(), { wrapper })
    await waitFor(() => expect(methodsResult.current.data).toEqual(paymentMethods))

    const { result: historyResult } = renderHook(() => usePaymentHistory(), { wrapper })
    await waitFor(() => expect(historyResult.current.data).toEqual({ history, total: 1 }))
  })

  it('invalidates subscription queries after plan changes', async () => {
    vi.mocked(subscriptionApi.updateSubscription).mockResolvedValue(subscription)
    vi.mocked(subscriptionApi.cancelSubscription).mockResolvedValue(subscription)
    vi.mocked(subscriptionApi.resumeSubscription).mockResolvedValue(subscription)
    vi.mocked(subscriptionApi.subscribeWithCrypto).mockResolvedValue(subscription)

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: updateResult } = renderHook(() => useUpdateSubscription(), { wrapper })
    await act(async () => {
      await updateResult.current.mutateAsync('pro')
    })

    const { result: cancelResult } = renderHook(() => useCancelSubscription(), { wrapper })
    await act(async () => {
      await cancelResult.current.mutateAsync()
    })

    const { result: resumeResult } = renderHook(() => useResumeSubscription(), { wrapper })
    await act(async () => {
      await resumeResult.current.mutateAsync()
    })

    const { result: cryptoResult } = renderHook(() => useSubscribeWithCrypto(), { wrapper })
    await act(async () => {
      await cryptoResult.current.mutateAsync({ planType: 'pro', paymentMethodId: 'pm-crypto' })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: subscriptionKeys.current() })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: subscriptionKeys.usage() })
  })

  it('handles payment method mutations', async () => {
    vi.mocked(subscriptionApi.addPaymentMethod).mockResolvedValue(paymentMethods[0])
    vi.mocked(subscriptionApi.addCryptoPaymentMethod).mockResolvedValue(paymentMethods[1])
    vi.mocked(subscriptionApi.removePaymentMethod).mockResolvedValue(undefined)
    vi.mocked(subscriptionApi.setDefaultPaymentMethod).mockResolvedValue(paymentMethods[0])
    vi.mocked(subscriptionApi.updatePaymentMethod).mockResolvedValue(paymentMethods[0])

    const queryClient = createTestQueryClient()
    queryClient.setQueryData(subscriptionKeys.paymentMethods(), paymentMethods)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: addCard } = renderHook(() => useAddPaymentMethod(), { wrapper })
    await act(async () => {
      await addCard.current.mutateAsync({
        type: 'card',
        cardholderName: 'Test',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 1,
        expiryYear: 2030
      })
    })

    const { result: addCrypto } = renderHook(() => useAddCryptoPaymentMethod(), { wrapper })
    await act(async () => {
      await addCrypto.current.mutateAsync({
        walletAddress: '0xabc',
        network: 'ethereum',
        currency: 'USDT'
      })
    })

    const { result: removeMethod } = renderHook(() => useRemovePaymentMethod(), { wrapper })
    await act(async () => {
      await removeMethod.current.mutateAsync('pm-card')
    })

    const { result: setDefault } = renderHook(() => useSetDefaultPaymentMethod(), { wrapper })
    await act(async () => {
      await setDefault.current.mutateAsync('pm-crypto')
    })

    const updated = queryClient.getQueryData(subscriptionKeys.paymentMethods())
    expect(updated).toEqual([
      { ...paymentMethods[0], isDefault: false },
      { ...paymentMethods[1], isDefault: true }
    ])

    const { result: updateMethod } = renderHook(() => useUpdatePaymentMethod(), { wrapper })
    await act(async () => {
      await updateMethod.current.mutateAsync({
        id: 'pm-card',
        expiryMonth: 2,
        expiryYear: 2031
      })
    })

    await act(async () => {
      await updateMethod.current.mutateAsync({
        id: 'pm-crypto',
        walletAddress: '0xdef'
      })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: subscriptionKeys.paymentMethods() })
  })

  it('keeps payment methods unchanged for mismatched update payloads', async () => {
    vi.mocked(subscriptionApi.updatePaymentMethod).mockResolvedValue(paymentMethods[1])

    const queryClient = createTestQueryClient()
    queryClient.setQueryData(subscriptionKeys.paymentMethods(), paymentMethods)
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useUpdatePaymentMethod(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({
        id: 'pm-crypto',
        expiryMonth: 3,
        expiryYear: 2032
      })
    })

    expect(queryClient.getQueryData(subscriptionKeys.paymentMethods())).toEqual(paymentMethods)
  })

  it('restores payment methods when update fails', async () => {
    vi.mocked(subscriptionApi.updatePaymentMethod).mockRejectedValue(new Error('fail'))

    const queryClient = createTestQueryClient()
    queryClient.setQueryData(subscriptionKeys.paymentMethods(), paymentMethods)
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useUpdatePaymentMethod(), { wrapper })
    await expect(
      result.current.mutateAsync({
        id: 'pm-card',
        expiryMonth: 2,
        expiryYear: 2031
      })
    ).rejects.toThrow('fail')

    expect(queryClient.getQueryData(subscriptionKeys.paymentMethods())).toEqual(paymentMethods)
  })

  it('creates checkout and billing sessions', async () => {
    vi.mocked(subscriptionApi.createCheckoutSession).mockResolvedValue({ url: 'https://pay' })
    vi.mocked(subscriptionApi.createBillingPortalSession).mockResolvedValue({ url: 'https://portal' })

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result: checkout } = renderHook(() => useCreateCheckoutSession(), { wrapper })
    await act(async () => {
      await checkout.current.mutateAsync('pro')
    })

    const { result: portal } = renderHook(() => useCreateBillingPortalSession(), { wrapper })
    await act(async () => {
      await portal.current.mutateAsync()
    })

    expect(subscriptionApi.createCheckoutSession).toHaveBeenCalledWith('pro')
    expect(subscriptionApi.createBillingPortalSession).toHaveBeenCalled()
  })

  it('skips plan details when plan type is missing', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    renderHook(() => usePlanDetails('' as PlanType), { wrapper })
    await Promise.resolve()

    expect(subscriptionApi.getPlanDetails).not.toHaveBeenCalled()
  })

  it('rolls back default payment method on error', async () => {
    vi.mocked(subscriptionApi.setDefaultPaymentMethod).mockRejectedValue(new Error('fail'))

    const queryClient = createTestQueryClient()
    queryClient.setQueryData(subscriptionKeys.paymentMethods(), paymentMethods)
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useSetDefaultPaymentMethod(), { wrapper })
    await expect(result.current.mutateAsync('pm-crypto')).rejects.toThrow('fail')

    expect(queryClient.getQueryData(subscriptionKeys.paymentMethods())).toEqual(paymentMethods)
  })

  it('skips rollback when default payment method cache is empty', async () => {
    vi.mocked(subscriptionApi.setDefaultPaymentMethod).mockRejectedValue(new Error('fail'))

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useSetDefaultPaymentMethod(), { wrapper })
    await expect(result.current.mutateAsync('pm-crypto')).rejects.toThrow('fail')
  })

  it('skips rollback when update cache is empty', async () => {
    vi.mocked(subscriptionApi.updatePaymentMethod).mockRejectedValue(new Error('fail'))

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useUpdatePaymentMethod(), { wrapper })
    await expect(
      result.current.mutateAsync({
        id: 'pm-card',
        expiryMonth: 2,
        expiryYear: 2031
      })
    ).rejects.toThrow('fail')
  })
})
