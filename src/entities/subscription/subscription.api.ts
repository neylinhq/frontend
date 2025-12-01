import { API_DELAYS, delay } from '@/shared/config/api-delays'
import { API_ENDPOINTS } from '@/shared/config/api-endpoints'
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

// Mock Data
const MOCK_PLANS: PlanDetails[] = [
  {
    type: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'usd',
    interval: 'month',
    limits: {
      maxMaps: 3,
      maxNodesPerMap: 50,
      maxTotalNodes: 150,
      aiModels: ['gpt-3.5-turbo'],
      aiRequestsPerMonth: 20
    },
    features: [
      'Up to 3 knowledge maps',
      'Up to 50 nodes per map',
      'Basic AI assistant (GPT-3.5)',
      '20 AI requests per month',
      'Community support'
    ]
  },
  {
    type: 'pro',
    name: 'Pro',
    description: 'For serious knowledge builders',
    price: 1500, // $15.00
    currency: 'usd',
    interval: 'month',
    limits: {
      maxMaps: 20,
      maxNodesPerMap: 500,
      maxTotalNodes: 5000,
      aiModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-sonnet'],
      aiRequestsPerMonth: 200
    },
    features: [
      'Up to 20 knowledge maps',
      'Up to 500 nodes per map',
      'Advanced AI models (GPT-4, Claude)',
      '200 AI requests per month',
      'Priority support',
      'Export to multiple formats',
      'Collaboration features'
    ]
  },
  {
    type: 'ultra',
    name: 'Ultra',
    description: 'Unlimited power for teams',
    price: 4900, // $49.00
    currency: 'usd',
    interval: 'month',
    limits: {
      maxMaps: null, // unlimited
      maxNodesPerMap: null,
      maxTotalNodes: null,
      aiModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-sonnet', 'claude-opus'],
      aiRequestsPerMonth: null // unlimited
    },
    features: [
      'Unlimited knowledge maps',
      'Unlimited nodes',
      'All AI models including Claude Opus',
      'Unlimited AI requests',
      'Dedicated support',
      'Advanced analytics',
      'Team collaboration',
      'API access',
      'Custom integrations'
    ]
  }
]

const MOCK_SUBSCRIPTION: Subscription = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: '1',
  planType: 'free',
  status: 'active',
  currentPeriodStart: '2025-01-01T00:00:00Z',
  currentPeriodEnd: '2025-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

const MOCK_USAGE: UsageStats = {
  mapsCount: 2,
  totalNodesCount: 45,
  aiRequestsThisMonth: 8,
  storageUsedMB: 12.5
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    type: 'card',
    last4: '5555',
    brand: 'mastercard',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    createdAt: '2024-03-20T14:30:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    type: 'card',
    last4: '0005',
    brand: 'amex',
    expiryMonth: 6,
    expiryYear: 2027,
    isDefault: false,
    createdAt: '2024-05-10T09:15:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    type: 'card',
    last4: '1117',
    brand: 'discover',
    expiryMonth: 3,
    expiryYear: 2026,
    isDefault: false,
    createdAt: '2024-06-25T16:45:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440005',
    type: 'card',
    last4: '0009',
    brand: 'diners',
    expiryMonth: 11,
    expiryYear: 2025,
    isDefault: false,
    createdAt: '2024-07-12T11:20:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440006',
    type: 'card',
    last4: '0002',
    brand: 'jcb',
    expiryMonth: 9,
    expiryYear: 2026,
    isDefault: false,
    createdAt: '2024-08-18T13:50:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440007',
    type: 'card',
    last4: '0008',
    brand: 'unionpay',
    expiryMonth: 4,
    expiryYear: 2027,
    isDefault: false,
    createdAt: '2024-09-05T08:30:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440008',
    type: 'crypto',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    walletAddressShort: '0x742d...f44e',
    network: 'ethereum',
    currency: 'ETH',
    isDefault: false,
    createdAt: '2024-10-12T15:00:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440009',
    type: 'crypto',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    walletAddressShort: 'bc1qxy...0wlh',
    network: 'bitcoin',
    currency: 'BTC',
    isDefault: false,
    createdAt: '2024-10-15T09:30:00Z'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440010',
    type: 'crypto',
    walletAddress: '7EcDhSYGxXyscszYEp35KHN8sxMEJkJNVwRCKGNnXQY3',
    walletAddressShort: '7EcDhS...XQY3',
    network: 'solana',
    currency: 'SOL',
    isDefault: false,
    createdAt: '2024-11-01T12:15:00Z'
  }
]

const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    amount: 1500,
    currency: 'usd',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    invoiceUrl: `${API_ENDPOINTS.INVOICE_EXAMPLE}/inv-001`,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    amount: 1500,
    currency: 'usd',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    invoiceUrl: `${API_ENDPOINTS.INVOICE_EXAMPLE}/inv-002`,
    createdAt: '2024-12-01T00:00:00Z'
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440004',
    amount: 1500,
    currency: 'usd',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    invoiceUrl: `${API_ENDPOINTS.INVOICE_EXAMPLE}/inv-003`,
    createdAt: '2024-11-01T00:00:00Z'
  }
]

// API Client - Following sessionApi pattern with setTimeout delays
export const subscriptionApi = {
  // Get current subscription
  getCurrentSubscription: async (): Promise<Subscription> => {
    await delay(API_DELAYS.SUBSCRIPTION_GET_CURRENT)
    return MOCK_SUBSCRIPTION
  },

  // Get usage statistics
  getUsageStats: async (): Promise<UsageStats> => {
    await delay(API_DELAYS.SUBSCRIPTION_GET_USAGE)
    return MOCK_USAGE
  },

  // Get all available plans
  getPlans: async (): Promise<PlanDetails[]> => {
    await delay(API_DELAYS.SUBSCRIPTION_GET_PLANS)
    return MOCK_PLANS
  },

  // Get specific plan details
  getPlanDetails: async (planType: PlanType): Promise<PlanDetails> => {
    await delay(API_DELAYS.SUBSCRIPTION_GET_PLAN_DETAILS)
    const plan = MOCK_PLANS.find(p => p.type === planType)
    if (!plan) {
      throw new Error(`Plan ${planType} not found`)
    }
    return plan
  },

  // Create checkout session for upgrade
  createCheckoutSession: async (planType: PlanType): Promise<CheckoutSession> => {
    await delay(API_DELAYS.SUBSCRIPTION_CREATE_CHECKOUT)
    return {
      url: `${API_ENDPOINTS.STRIPE_CHECKOUT}/session-${planType}`,
      sessionId: `cs_test_${Math.random().toString(36).substring(7)}`
    }
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<Subscription> => {
    await delay(API_DELAYS.SUBSCRIPTION_CANCEL)
    return {
      ...MOCK_SUBSCRIPTION,
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString()
    }
  },

  // Resume cancelled subscription
  resumeSubscription: async (): Promise<Subscription> => {
    await delay(API_DELAYS.SUBSCRIPTION_RESUME)
    return {
      ...MOCK_SUBSCRIPTION,
      cancelAtPeriodEnd: false,
      updatedAt: new Date().toISOString()
    }
  },

  // Update subscription plan
  updateSubscription: async (planType: PlanType): Promise<Subscription> => {
    await delay(API_DELAYS.SUBSCRIPTION_UPDATE)
    return {
      ...MOCK_SUBSCRIPTION,
      planType,
      updatedAt: new Date().toISOString()
    }
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    await delay(API_DELAYS.SUBSCRIPTION_GET_PAYMENT_METHODS)
    return MOCK_PAYMENT_METHODS
  },

  // Add payment method
  addPaymentMethod: async (input: AddPaymentMethodInput): Promise<PaymentMethod> => {
    await delay(API_DELAYS.SUBSCRIPTION_ADD_PAYMENT_METHOD)
    return {
      id: `pm-${Date.now()}`,
      type: 'card',
      last4: input.cardNumber,
      brand: input.brand,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
      isDefault: MOCK_PAYMENT_METHODS.length === 0,
      createdAt: new Date().toISOString()
    }
  },

  // Remove payment method
  removePaymentMethod: async (_paymentMethodId: string): Promise<void> => {
    await delay(API_DELAYS.SUBSCRIPTION_REMOVE_PAYMENT_METHOD)
    // Mock implementation - no-op
  },

  // Set default payment method
  setDefaultPaymentMethod: async (_paymentMethodId: string): Promise<void> => {
    await delay(API_DELAYS.SUBSCRIPTION_SET_DEFAULT_PAYMENT)
    // Mock implementation - no-op
  },

  // Update payment method (card expiry or crypto wallet address)
  updatePaymentMethod: async (input: UpdatePaymentMethodInput): Promise<PaymentMethod> => {
    await delay(API_DELAYS.SUBSCRIPTION_UPDATE_PAYMENT_METHOD)
    const method = MOCK_PAYMENT_METHODS.find(m => m.id === input.id)
    if (!method) {
      throw new Error('Payment method not found')
    }

    if ('expiryMonth' in input && method.type === 'card') {
      return { ...method, expiryMonth: input.expiryMonth, expiryYear: input.expiryYear }
    }
    if ('walletAddress' in input && method.type === 'crypto') {
      const short = `${input.walletAddress.slice(0, 6)}...${input.walletAddress.slice(-4)}`
      return { ...method, walletAddress: input.walletAddress, walletAddressShort: short }
    }
    return method
  },

  // Get payment history
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    await delay(API_DELAYS.SUBSCRIPTION_GET_PAYMENT_HISTORY)
    return MOCK_PAYMENT_HISTORY
  },

  // Create billing portal session
  createBillingPortalSession: async (): Promise<BillingPortalSession> => {
    await delay(API_DELAYS.SUBSCRIPTION_CREATE_BILLING_PORTAL)
    return {
      url: API_ENDPOINTS.STRIPE_BILLING_PORTAL,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min
    }
  }
}
