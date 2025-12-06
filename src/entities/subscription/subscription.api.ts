import { api } from '@/shared/api/api-client'
import type {
  PaymentHistory,
  PaymentMethod,
  PlanDetails,
  PlanType,
  Subscription,
  UsageStats
} from './subscription.schema'
import type {
  AddPaymentMethodInput,
  BillingPortalSession,
  CheckoutSession,
  UpdatePaymentMethodInput
} from './subscription.types'

// Response types matching backend API
interface ApiResponse<T> {
  success: boolean
  data: T
}

interface PlansResponse {
  success: boolean
  data: PlanDetails[]
}

interface PaymentMethodsResponse {
  success: boolean
  data: PaymentMethod[]
}

interface PaymentHistoryResponse {
  success: boolean
  data: PaymentHistory[]
  meta?: {
    total: number
    limit: number
    offset: number
  }
}

export const subscriptionApi = {
  // Get current subscription
  getCurrentSubscription: async (): Promise<Subscription> => {
    const response = await api.get<ApiResponse<Subscription>>('/subscriptions/current')
    return response.data
  },

  // Get usage statistics
  getUsageStats: async (): Promise<UsageStats> => {
    const response = await api.get<ApiResponse<UsageStats>>('/subscriptions/usage')
    return response.data
  },

  // Get all available plans
  getPlans: async (): Promise<PlanDetails[]> => {
    const response = await api.get<PlansResponse>('/subscriptions/plans')
    return response.data
  },

  // Get specific plan details
  getPlanDetails: async (planType: PlanType): Promise<PlanDetails> => {
    const response = await api.get<ApiResponse<PlanDetails>>(`/subscriptions/plans/${planType}`)
    return response.data
  },

  // Create checkout session for upgrade
  createCheckoutSession: async (planType: PlanType): Promise<CheckoutSession> => {
    const response = await api.post<ApiResponse<CheckoutSession>>('/subscriptions/checkout', {
      planType
    })
    return response.data
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<Subscription> => {
    const response = await api.post<ApiResponse<Subscription>>('/subscriptions/cancel')
    return response.data
  },

  // Resume cancelled subscription
  resumeSubscription: async (): Promise<Subscription> => {
    const response = await api.post<ApiResponse<Subscription>>('/subscriptions/resume')
    return response.data
  },

  // Update subscription plan (change plan)
  updateSubscription: async (planType: PlanType): Promise<Subscription> => {
    const response = await api.post<ApiResponse<Subscription>>('/subscriptions/change-plan', {
      planType
    })
    return response.data
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get<PaymentMethodsResponse>('/payments/methods')
    return response.data
  },

  // Add card payment method
  addPaymentMethod: async (input: AddPaymentMethodInput): Promise<PaymentMethod> => {
    const response = await api.post<ApiResponse<PaymentMethod>>('/payments/methods/card', input)
    return response.data
  },

  // Add crypto payment method
  addCryptoPaymentMethod: async (data: {
    walletAddress: string
    network: string
    currency: string
  }): Promise<PaymentMethod> => {
    const response = await api.post<ApiResponse<PaymentMethod>>('/payments/methods/crypto', data)
    return response.data
  },

  // Remove payment method
  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.delete(`/payments/methods/${paymentMethodId}`)
  },

  // Set default payment method
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await api.post<ApiResponse<PaymentMethod>>('/payments/methods/default', {
      paymentMethodId
    })
    return response.data
  },

  // Update payment method (card expiry or crypto wallet address)
  updatePaymentMethod: async (input: UpdatePaymentMethodInput): Promise<PaymentMethod> => {
    const { id, ...data } = input
    const response = await api.patch<ApiResponse<PaymentMethod>>(`/payments/methods/${id}`, data)
    return response.data
  },

  // Get payment history
  getPaymentHistory: async (
    limit = 20,
    offset = 0
  ): Promise<{ history: PaymentHistory[]; total: number }> => {
    const response = await api.get<PaymentHistoryResponse>(
      `/payments/history?limit=${limit}&offset=${offset}`
    )
    return {
      history: response.data,
      total: response.meta?.total ?? response.data.length
    }
  },

  // Create billing portal session
  createBillingPortalSession: async (): Promise<BillingPortalSession> => {
    const response = await api.post<ApiResponse<BillingPortalSession>>(
      '/subscriptions/billing-portal'
    )
    return response.data
  }
}
