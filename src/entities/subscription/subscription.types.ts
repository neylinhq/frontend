import type { CardBrand } from './subscription.schema'

// Additional types that don't need Zod validation

export interface BillingPortalSession {
  url: string
  expiresAt: string
}

export interface CheckoutSession {
  url: string
  sessionId: string
}

// Input for adding a new payment method
export interface AddPaymentMethodInput {
  cardholderName: string
  cardNumber: string // Last 4 digits only
  brand: CardBrand
  expiryMonth: number
  expiryYear: number
}
