import { delay, HttpResponse, http } from 'msw'
import type { Subscription } from '@/entities/subscription'
import { API_URL } from '@/shared/config/env'
import { mockPlans, mockSubscription, mockUsageStats } from '../data'

// Mutable subscription state
let currentSubscription = { ...mockSubscription }

export const subscriptionHandlers = [
  // Get current subscription
  http.get(`${API_URL}/subscriptions/current`, async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: currentSubscription
    })
  }),

  // Get usage stats
  http.get(`${API_URL}/subscriptions/usage`, async ({ request }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const plan = mockPlans.find(p => p.type === currentSubscription.planType)

    return HttpResponse.json({
      success: true,
      data: {
        ...mockUsageStats,
        mapsLimit: plan?.limits.maxMaps ?? null,
        nodesLimit: plan?.limits.maxTotalNodes ?? null,
        aiRequestsLimit: plan?.limits.aiRequestsPerMonth ?? null,
        storageLimitMB: 1000
      }
    })
  }),

  // Get all plans
  http.get(`${API_URL}/subscriptions/plans`, async () => {
    await delay(200)

    return HttpResponse.json({
      success: true,
      data: mockPlans.map(plan => ({
        ...plan,
        priceMonthly: plan.price,
        priceYearly: Math.round(plan.price * 10) // ~2 months free
      }))
    })
  }),

  // Get plan details
  http.get(`${API_URL}/subscriptions/plans/:type`, async ({ params }) => {
    await delay(100)

    const plan = mockPlans.find(p => p.type === params.type)
    if (!plan) {
      return HttpResponse.json(
        { success: false, error: { code: 'INVALID_PLAN_TYPE', message: 'Invalid plan type' } },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: plan
    })
  }),

  // Create checkout session
  http.post(`${API_URL}/subscriptions/checkout`, async ({ request }) => {
    await delay(500)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      planType: string
      successUrl: string
      cancelUrl: string
    }

    return HttpResponse.json({
      success: true,
      data: {
        url: `https://checkout.stripe.com/pay/mock_session_${Date.now()}`,
        sessionId: `cs_mock_${Date.now()}`
      }
    })
  }),

  // Create billing portal session
  http.post(`${API_URL}/subscriptions/billing-portal`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        url: `https://billing.stripe.com/p/session/mock_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      }
    })
  }),

  // Cancel subscription
  http.post(`${API_URL}/subscriptions/cancel`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    currentSubscription = {
      ...currentSubscription,
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: currentSubscription
    })
  }),

  // Resume subscription
  http.post(`${API_URL}/subscriptions/resume`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    currentSubscription = {
      ...currentSubscription,
      cancelAtPeriodEnd: false,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: currentSubscription
    })
  }),

  // Change plan
  http.post(`${API_URL}/subscriptions/change-plan`, async ({ request }) => {
    await delay(500)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { planType: 'free' | 'pro' | 'ultra' }

    if (!['free', 'pro', 'ultra'].includes(body.planType)) {
      return HttpResponse.json(
        { success: false, error: { code: 'INVALID_PLAN_TYPE', message: 'Invalid plan type' } },
        { status: 400 }
      )
    }

    currentSubscription = {
      ...currentSubscription,
      planType: body.planType,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: currentSubscription
    })
  })
]

// Export for resetting state in tests
export const resetSubscriptionState = () => {
  currentSubscription = { ...mockSubscription }
}
