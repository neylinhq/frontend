import { z } from 'zod'

// Plan types
export const PlanTypeEnum = z.enum(['free', 'pro', 'ultra'])
export type PlanType = z.infer<typeof PlanTypeEnum>

// Subscription schema
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  planType: PlanTypeEnum,
  status: z.enum(['active', 'cancelled', 'past_due', 'trialing']),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export type Subscription = z.infer<typeof SubscriptionSchema>

// Plan limits schema
export const PlanLimitsSchema = z.object({
  maxMaps: z.number().nullable(), // null = unlimited
  maxNodesPerMap: z.number().nullable(),
  maxTotalNodes: z.number().nullable(),
  aiModels: z.array(z.string()), // ['gpt-3.5-turbo', 'gpt-4', 'claude-sonnet', 'claude-opus']
  aiRequestsPerMonth: z.number().nullable()
})

export type PlanLimits = z.infer<typeof PlanLimitsSchema>

// Plan details schema
export const PlanDetailsSchema = z.object({
  type: PlanTypeEnum,
  name: z.string(),
  description: z.string(),
  price: z.number(), // in cents
  currency: z.string(),
  interval: z.enum(['month', 'year']),
  limits: PlanLimitsSchema,
  features: z.array(z.string())
})

export type PlanDetails = z.infer<typeof PlanDetailsSchema>

// Usage statistics schema
export const UsageStatsSchema = z.object({
  mapsCount: z.number(),
  totalNodesCount: z.number(),
  aiRequestsThisMonth: z.number(),
  storageUsedMB: z.number()
})

export type UsageStats = z.infer<typeof UsageStatsSchema>

// Card brands
export const CardBrandEnum = z.enum([
  'visa',
  'mastercard',
  'amex',
  'discover',
  'diners',
  'jcb',
  'unionpay'
])
export type CardBrand = z.infer<typeof CardBrandEnum>

// Crypto networks for USDT payments (Connect Wallet)
// На данный момент поддерживаем только TON
export const CryptoNetworkEnum = z.enum(['ton'])
export type CryptoNetwork = z.infer<typeof CryptoNetworkEnum>

export const CryptoCurrencyEnum = z.enum(['USDT'])
export type CryptoCurrency = z.infer<typeof CryptoCurrencyEnum>

// Base payment method fields
const BasePaymentMethodSchema = z.object({
  id: z.string().uuid(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime()
})

// Card payment method
export const CardPaymentMethodSchema = BasePaymentMethodSchema.extend({
  type: z.literal('card'),
  last4: z.string(),
  brand: CardBrandEnum,
  expiryMonth: z.number(),
  expiryYear: z.number()
})

export type CardPaymentMethod = z.infer<typeof CardPaymentMethodSchema>

// Crypto payment method
export const CryptoPaymentMethodSchema = BasePaymentMethodSchema.extend({
  type: z.literal('crypto'),
  walletAddress: z.string(),
  walletAddressShort: z.string(),
  network: CryptoNetworkEnum,
  currency: CryptoCurrencyEnum
})

export type CryptoPaymentMethod = z.infer<typeof CryptoPaymentMethodSchema>

// Discriminated union
export const PaymentMethodSchema = z.discriminatedUnion('type', [
  CardPaymentMethodSchema,
  CryptoPaymentMethodSchema
])

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

// Payment history schema
export const PaymentHistorySchema = z.object({
  id: z.string().uuid(),
  amount: z.number(), // in cents
  currency: z.string(),
  status: z.enum(['succeeded', 'pending', 'failed', 'refunded']),
  description: z.string(),
  invoiceUrl: z.string().url().optional(),
  createdAt: z.string().datetime()
})

export type PaymentHistory = z.infer<typeof PaymentHistorySchema>
