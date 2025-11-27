/**
 * API Endpoints Configuration
 *
 * Централизованные константы для URL адресов внешних API и сервисов.
 */

/**
 * Адреса внешних API и сервисов
 */
export const API_ENDPOINTS = {
  /** Сервис генерации аватаров DiceBear */
  AVATAR_PROVIDER: 'https://api.dicebear.com/7.x/avataaars/svg',

  /** Stripe Checkout для создания сессии оплаты */
  STRIPE_CHECKOUT: 'https://checkout.stripe.com',

  /** Stripe Billing Portal для управления подпиской */
  STRIPE_BILLING_PORTAL: 'https://billing.stripe.com/portal-session',

  /** Пример URL для счетов (mock data) */
  INVOICE_EXAMPLE: 'https://example.com/invoices',

  /** GitHub аватар для тестового пользователя */
  GITHUB_AVATAR: 'https://github.com/shadcn.png',
} as const

/**
 * Генерирует URL для аватара на основе seed значения
 * @param seed - уникальный идентификатор для генерации аватара
 * @returns полный URL для аватара
 */
export const generateAvatarUrl = (seed: string | number): string =>
  `${API_ENDPOINTS.AVATAR_PROVIDER}?seed=${seed}`
