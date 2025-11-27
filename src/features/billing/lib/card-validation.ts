/**
 * Card Validation
 *
 * Константы и утилиты для валидации платежных карт в формах оплаты.
 */

/**
 * Константы для валидации полей банковской карты
 */
export const CARD_VALIDATION = {
  /** Максимальная длина номера карты (с пробелами) */
  CARD_NUMBER_MAX_LENGTH: 23,

  /** Максимальная длина поля срока действия (MM/YY) */
  EXPIRY_MAX_LENGTH: 5,

  /** Длина CVV кода для карт American Express */
  CVC_LENGTH_AMEX: 4,

  /** Длина CVV кода для остальных типов карт */
  CVC_LENGTH_OTHER: 3,

  /** Placeholder для поля номера карты */
  CARD_NUMBER_PLACEHOLDER: '1234 5678 9012 3456',

  /** Placeholder для поля срока действия */
  EXPIRY_PLACEHOLDER: 'MM/YY',

  /** Placeholder для поля CVV */
  CVC_PLACEHOLDER: 'CVV',
} as const

/**
 * Получает длину CVV кода в зависимости от типа карты
 * @param cardBrand - тип платежной системы карты
 * @returns длина CVV кода (3 или 4 цифры)
 */
export const getCvcLength = (cardBrand: string): number =>
  cardBrand === 'amex' ? CARD_VALIDATION.CVC_LENGTH_AMEX : CARD_VALIDATION.CVC_LENGTH_OTHER

/**
 * Получает placeholder для CVV поля в зависимости от типа карты
 * @param cardBrand - тип платежной системы карты
 * @returns строка-placeholder
 */
export const getCvcPlaceholder = (cardBrand: string): string =>
  cardBrand === 'amex' ? 'XXXX' : 'XXX'
