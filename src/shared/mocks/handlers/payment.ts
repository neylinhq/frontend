import { delay, HttpResponse, http } from 'msw'
import type { PaymentMethod } from '@/entities/subscription'
import { API_URL } from '@/shared/config/env'
import { mockPaymentHistory, mockPaymentMethods } from '../data'

// Mutable payment methods state
let paymentMethods = [...mockPaymentMethods]

export const paymentHandlers = [
  // List payment methods
  http.get(`${API_URL}/payments/methods`, async ({ request }) => {
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
      data: paymentMethods
    })
  }),

  // Add card payment method
  http.post(`${API_URL}/payments/methods/card`, async ({ request }) => {
    await delay(500)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { token: string; setDefault?: boolean }

    // Simulate Stripe token validation
    if (!body.token?.startsWith('tok_') && !body.token?.startsWith('pm_')) {
      return HttpResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payment token' } },
        { status: 400 }
      )
    }

    const newMethod: PaymentMethod = {
      id: `pm-${crypto.randomUUID().slice(0, 8)}`,
      type: 'card',
      last4: Math.random().toString().slice(2, 6),
      brand: ['visa', 'mastercard', 'amex'][Math.floor(Math.random() * 3)] as
        | 'visa'
        | 'mastercard'
        | 'amex',
      expiryMonth: Math.floor(Math.random() * 12) + 1,
      expiryYear: new Date().getFullYear() + Math.floor(Math.random() * 5) + 1,
      isDefault: body.setDefault ?? paymentMethods.length === 0,
      createdAt: new Date().toISOString()
    }

    if (newMethod.isDefault) {
      paymentMethods = paymentMethods.map(pm => ({ ...pm, isDefault: false }))
    }

    paymentMethods.push(newMethod)

    return HttpResponse.json(
      {
        success: true,
        data: newMethod
      },
      { status: 201 }
    )
  }),

  // Add crypto payment method
  http.post(`${API_URL}/payments/methods/crypto`, async ({ request }) => {
    await delay(400)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      walletAddress: string
      network: 'bitcoin' | 'ethereum' | 'solana' | 'tron'
      currency: 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL'
      setDefault?: boolean
    }

    const newMethod: PaymentMethod = {
      id: `pm-crypto-${crypto.randomUUID().slice(0, 8)}`,
      type: 'crypto',
      walletAddress: body.walletAddress,
      network: body.network,
      currency: body.currency,
      isDefault: body.setDefault ?? false,
      createdAt: new Date().toISOString()
    }

    if (newMethod.isDefault) {
      paymentMethods = paymentMethods.map(pm => ({ ...pm, isDefault: false }))
    }

    paymentMethods.push(newMethod)

    return HttpResponse.json(
      {
        success: true,
        data: newMethod
      },
      { status: 201 }
    )
  }),

  // Update payment method (card expiry only)
  http.put(`${API_URL}/payments/methods/:methodId`, async ({ request, params }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const methodIndex = paymentMethods.findIndex(pm => pm.id === params.methodId)
    if (methodIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PAYMENT_METHOD_NOT_FOUND', message: 'Payment method not found' }
        },
        { status: 404 }
      )
    }

    const method = paymentMethods[methodIndex]
    if (method.type !== 'card') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Can only update card expiry' }
        },
        { status: 400 }
      )
    }

    const body = (await request.json()) as { expMonth: number; expYear: number }

    paymentMethods[methodIndex] = {
      ...method,
      expiryMonth: body.expMonth,
      expiryYear: body.expYear
    }

    return HttpResponse.json({
      success: true,
      data: paymentMethods[methodIndex]
    })
  }),

  // Remove payment method
  http.delete(`${API_URL}/payments/methods/:methodId`, async ({ request, params }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const methodIndex = paymentMethods.findIndex(pm => pm.id === params.methodId)
    if (methodIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PAYMENT_METHOD_NOT_FOUND', message: 'Payment method not found' }
        },
        { status: 404 }
      )
    }

    const wasDefault = paymentMethods[methodIndex].isDefault
    paymentMethods.splice(methodIndex, 1)

    // If removed method was default, make first remaining method default
    if (wasDefault && paymentMethods.length > 0) {
      paymentMethods[0].isDefault = true
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // Set default payment method
  http.post(`${API_URL}/payments/methods/default`, async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { methodId: string }

    const methodIndex = paymentMethods.findIndex(pm => pm.id === body.methodId)
    if (methodIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PAYMENT_METHOD_NOT_FOUND', message: 'Payment method not found' }
        },
        { status: 404 }
      )
    }

    paymentMethods = paymentMethods.map((pm, i) => ({
      ...pm,
      isDefault: i === methodIndex
    }))

    return HttpResponse.json({
      success: true,
      data: paymentMethods[methodIndex]
    })
  }),

  // Get payment history
  http.get(`${API_URL}/payments/history`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    const paginatedHistory = mockPaymentHistory.slice(offset, offset + limit)

    return HttpResponse.json({
      success: true,
      data: {
        payments: paginatedHistory,
        totalCount: mockPaymentHistory.length
      }
    })
  })
]

// Export for resetting state in tests
export const resetPaymentState = () => {
  paymentMethods = [...mockPaymentMethods]
}
