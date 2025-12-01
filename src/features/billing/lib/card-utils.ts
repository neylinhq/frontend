// Card brand detection and utilities

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'unionpay'
  | 'unknown'

// Brand colors for visual accents
export const CARD_BRAND_COLORS: Record<
  CardBrand,
  { primary: string; secondary: string; gradient: string }
> = {
  visa: {
    primary: '#1A1F71',
    secondary: '#2E77BC',
    gradient: 'linear-gradient(135deg, #1A1F71 0%, #2E77BC 100%)'
  },
  mastercard: {
    primary: '#EB001B',
    secondary: '#F79E1B',
    gradient: 'linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)'
  },
  amex: {
    primary: '#006FCF',
    secondary: '#00A4E4',
    gradient: 'linear-gradient(135deg, #006FCF 0%, #00A4E4 100%)'
  },
  discover: {
    primary: '#FF6000',
    secondary: '#FFBC3F',
    gradient: 'linear-gradient(135deg, #FF6000 0%, #FFBC3F 100%)'
  },
  diners: {
    primary: '#0079BE',
    secondary: '#00A4E4',
    gradient: 'linear-gradient(135deg, #0079BE 0%, #00A4E4 100%)'
  },
  jcb: {
    primary: '#0E4C96',
    secondary: '#007940',
    gradient: 'linear-gradient(135deg, #0E4C96 0%, #E71E27 50%, #007940 100%)'
  },
  unionpay: {
    primary: '#E21836',
    secondary: '#00447C',
    gradient: 'linear-gradient(135deg, #E21836 0%, #00447C 100%)'
  },
  unknown: {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)'
  }
}

interface CardBrandConfig {
  brand: CardBrand
  pattern: RegExp
  lengths: number[]
  cvcLength: number
  gaps: number[]
}

const CARD_BRANDS: CardBrandConfig[] = [
  {
    brand: 'visa',
    pattern: /^4/,
    lengths: [16, 18, 19],
    cvcLength: 3,
    gaps: [4, 8, 12]
  },
  {
    brand: 'mastercard',
    pattern: /^(5[1-5]|2[2-7])/,
    lengths: [16],
    cvcLength: 3,
    gaps: [4, 8, 12]
  },
  {
    brand: 'amex',
    pattern: /^3[47]/,
    lengths: [15],
    cvcLength: 4,
    gaps: [4, 10]
  },
  {
    brand: 'discover',
    pattern: /^(6011|65|64[4-9])/,
    lengths: [16, 19],
    cvcLength: 3,
    gaps: [4, 8, 12]
  },
  {
    brand: 'diners',
    pattern: /^(36|38|30[0-5])/,
    lengths: [14, 16, 19],
    cvcLength: 3,
    gaps: [4, 10]
  },
  {
    brand: 'jcb',
    pattern: /^35/,
    lengths: [16, 17, 18, 19],
    cvcLength: 3,
    gaps: [4, 8, 12]
  },
  {
    brand: 'unionpay',
    pattern: /^62/,
    lengths: [16, 17, 18, 19],
    cvcLength: 3,
    gaps: [4, 8, 12]
  }
]

/**
 * Detect card brand from card number
 */
export const detectCardBrand = (cardNumber: string) => {
  const digits = cardNumber.replace(/\D/g, '')

  for (const config of CARD_BRANDS) {
    if (config.pattern.test(digits)) {
      return config.brand
    }
  }

  return 'unknown'
}

/**
 * Get card brand configuration
 */
export const getCardBrandConfig = (brand: CardBrand) => {
  return CARD_BRANDS.find(config => config.brand === brand)
}

/**
 * Luhn algorithm for card number validation
 */
export const isValidLuhn = (cardNumber: string) => {
  const digits = cardNumber.replace(/\D/g, '')

  if (digits.length === 0) {
    return false
  }

  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Format card number with spaces
 */
export const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const brand = detectCardBrand(digits)
  const config = getCardBrandConfig(brand)
  const gaps = config?.gaps ?? [4, 8, 12]

  let formatted = ''
  let gapIndex = 0

  for (let i = 0; i < digits.length; i++) {
    if (gapIndex < gaps.length && i === gaps[gapIndex]) {
      formatted += ' '
      gapIndex++
    }
    formatted += digits[i]
  }

  return formatted
}

/**
 * Format expiry date as MM/YY
 */
export const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.length === 0) {
    return ''
  }
  if (digits.length === 1) {
    // Auto-prefix with 0 if user types 2-9
    if (parseInt(digits, 10) > 1) {
      return `0${digits}/`
    }
    return digits
  }
  if (digits.length === 2) {
    return `${digits}/`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
}

/**
 * Parse expiry string to month and year
 */
export const parseExpiry = (expiry: string) => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/)
  if (!match) {
    return null
  }

  const month = match[1]
  const year = `20${match[2]}`

  return { month, year }
}

/**
 * Validate expiry date
 */
export const isValidExpiry = (expiry: string) => {
  const parsed = parseExpiry(expiry)
  if (!parsed) {
    return false
  }

  const month = parseInt(parsed.month, 10)
  const year = parseInt(parsed.year, 10)

  if (month < 1 || month > 12) {
    return false
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (year < currentYear) {
    return false
  }
  if (year === currentYear && month < currentMonth) {
    return false
  }

  return true
}

/**
 * Get max card number length for brand
 */
export const getMaxCardLength = (brand: CardBrand) => {
  const config = getCardBrandConfig(brand)
  return config ? Math.max(...config.lengths) : 19
}

/**
 * Get CVC length for brand
 */
export const getCvcLength = (brand: CardBrand) => {
  const config = getCardBrandConfig(brand)
  return config?.cvcLength ?? 3
}

/**
 * Mask card number for display (show last 4)
 */
export const maskCardNumber = (cardNumber: string) => {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 4) {
    return digits
  }
  return `•••• ${digits.slice(-4)}`
}
