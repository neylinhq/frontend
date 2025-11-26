// Additional types that don't need Zod validation

export interface BillingPortalSession {
  url: string
  expiresAt: string
}

export interface CheckoutSession {
  url: string
  sessionId: string
}
