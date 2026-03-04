import { z } from 'zod'

import { CardBrandEnum } from '@/entities/subscription'
import { detectCardBrand, getCvcLength, isValidExpiry, isValidLuhn } from '@/shared/lib/card-utils'

export const addPaymentMethodSchema = z
  .object({
    cardholderName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long')
      .regex(/^[a-zA-Zа-яА-ЯёЁäöüÄÖÜß\s'-]+$/, 'Name contains invalid characters'),
    cardNumber: z
      .string()
      .min(13, 'Card number is too short')
      .max(23, 'Card number is too long') // 19 digits + 4 spaces
      .refine(
        value => {
          const digits = value.replace(/\D/g, '')
          return digits.length >= 13 && digits.length <= 19
        },
        { message: 'Invalid card number length' }
      )
      .refine(
        value => {
          const digits = value.replace(/\D/g, '')
          return isValidLuhn(digits)
        },
        { message: 'Invalid card number' }
      ),
    expiry: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, 'Use format MM/YY')
      .refine(isValidExpiry, { message: 'Card has expired or invalid date' }),
    cvc: z
      .string()
      .min(3, 'CVC is too short')
      .max(4, 'CVC is too long')
      .regex(/^\d+$/, 'CVC must contain only digits')
  })
  .refine(
    data => {
      // Validate CVC length matches card brand
      const brand = detectCardBrand(data.cardNumber)
      const expectedLength = getCvcLength(brand)
      const cvcLength = data.cvc.length
      return cvcLength === expectedLength || cvcLength === 3 // Allow 3 for unknown brands
    },
    {
      message: 'CVC length does not match card type',
      path: ['cvc']
    }
  )

export type AddPaymentMethodValues = z.infer<typeof addPaymentMethodSchema>

// Schema for the input data sent to API (without formatting)
export const paymentMethodInputSchema = z.object({
  cardholderName: z.string(),
  cardNumber: z.string(), // Last 4 digits only for storage
  brand: CardBrandEnum,
  expiryMonth: z.number(),
  expiryYear: z.number()
})

export type PaymentMethodInput = z.infer<typeof paymentMethodInputSchema>
