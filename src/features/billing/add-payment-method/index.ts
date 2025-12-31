export { AddPaymentMethodDialog } from './components/add-payment-method-dialog'
export type { AddPaymentMethodValues, PaymentMethodInput } from './lib/validation'
export { addPaymentMethodSchema } from './lib/validation'

// Crypto wallet input type for binding wallet
export type { CryptoNetwork } from '@/entities/subscription'

export interface CryptoWalletInput {
  network: import('@/entities/subscription').CryptoNetwork
  address: string
}
