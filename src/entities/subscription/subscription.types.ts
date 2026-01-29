/* v8 ignore file */
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

// Input for updating card expiry
export interface UpdateCardInput {
  id: string
  expiryMonth: number
  expiryYear: number
}

// Input for updating crypto wallet address
export interface UpdateCryptoWalletInput {
  id: string
  walletAddress: string
}

// Union type for updating any payment method
export type UpdatePaymentMethodInput = UpdateCardInput | UpdateCryptoWalletInput
