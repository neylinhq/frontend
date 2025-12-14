import type {
  PaymentHistory,
  PaymentMethod,
  PlanDetails,
  Subscription,
  UsageStats
} from '@/entities/subscription'

export const mockSubscription: Subscription = {
  id: 'sub-1234-5678-abcd-ef1234567890',
  userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  planType: 'pro',
  status: 'active',
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: new Date().toISOString()
}

export const mockPlans: PlanDetails[] = [
  {
    type: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    interval: 'month',
    limits: {
      maxMaps: 3,
      maxNodesPerMap: 50,
      maxTotalNodes: 150,
      aiModels: ['gpt-3.5-turbo'],
      aiRequestsPerMonth: 10
    },
    features: ['Up to 3 knowledge maps', 'Basic AI assistance', 'Community support']
  },
  {
    type: 'pro',
    name: 'Pro',
    description: 'For serious knowledge builders',
    price: 1900,
    currency: 'USD',
    interval: 'month',
    limits: {
      maxMaps: 20,
      maxNodesPerMap: 500,
      maxTotalNodes: 5000,
      aiModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-sonnet'],
      aiRequestsPerMonth: 100
    },
    features: [
      'Up to 20 knowledge maps',
      'Advanced AI models',
      'Priority support',
      'Export to PDF/Markdown',
      'Collaboration (coming soon)'
    ]
  },
  {
    type: 'ultra',
    name: 'Ultra',
    description: 'Unlimited knowledge mapping',
    price: 4900,
    currency: 'USD',
    interval: 'month',
    limits: {
      maxMaps: null,
      maxNodesPerMap: null,
      maxTotalNodes: null,
      aiModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-sonnet', 'claude-opus'],
      aiRequestsPerMonth: null
    },
    features: [
      'Unlimited knowledge maps',
      'All AI models including Claude Opus',
      'Unlimited AI requests',
      'White-glove onboarding',
      'Custom integrations',
      'SLA guarantee'
    ]
  }
]

export const mockUsageStats: UsageStats = {
  mapsCount: 5,
  totalNodesCount: 127,
  aiRequestsThisMonth: 23,
  storageUsedMB: 45.2
}

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1234-visa',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'pm-5678-mastercard',
    type: 'card',
    last4: '8888',
    brand: 'mastercard',
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false,
    createdAt: '2024-02-20T14:00:00Z'
  },
  {
    id: 'pm-crypto-eth',
    type: 'crypto',
    walletAddress: '0x1234...abcd',
    network: 'ethereum',
    currency: 'ETH',
    isDefault: false,
    createdAt: '2024-03-10T09:00:00Z'
  }
]

export const mockPaymentHistory: PaymentHistory[] = [
  {
    id: 'pay-001',
    amount: 1900,
    currency: 'USD',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    invoiceUrl: 'https://stripe.com/invoice/001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pay-002',
    amount: 1900,
    currency: 'USD',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    invoiceUrl: 'https://stripe.com/invoice/002',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pay-003',
    amount: 1900,
    currency: 'USD',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    invoiceUrl: 'https://stripe.com/invoice/003',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
]
