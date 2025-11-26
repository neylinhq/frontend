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

// Payment method schema
export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['card', 'paypal']),
  last4: z.string().optional(),
  brand: z.string().optional(), // 'visa', 'mastercard', etc.
  expiryMonth: z.number().optional(),
  expiryYear: z.number().optional(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime()
})

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
