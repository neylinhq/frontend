/**
 * Universal pluralization utility using Intl.PluralRules
 *
 * Supports Russian (one/few/many) and English (one/other) plural forms.
 *
 * @example
 * // Create a pluralizer for "items" in Russian
 * const itemsPlural = createPluralizer({
 *   one: 'элемент',
 *   few: 'элемента',
 *   many: 'элементов'
 * })
 *
 * itemsPlural(1, 'ru')  // "1 элемент"
 * itemsPlural(2, 'ru')  // "2 элемента"
 * itemsPlural(5, 'ru')  // "5 элементов"
 * itemsPlural(21, 'ru') // "21 элемент"
 *
 * // For English - only needs one form (plural is automatic)
 * const itemsPluralEn = createPluralizer({
 *   one: 'item',
 *   other: 'items'
 * })
 *
 * itemsPluralEn(1, 'en')  // "1 item"
 * itemsPluralEn(5, 'en')  // "5 items"
 */

type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

/**
 * Plural forms for a word
 *
 * Russian uses: one (1, 21, 31...), few (2-4, 22-24...), many (0, 5-20, 25-30...)
 * English uses: one (1), other (0, 2, 3, 4, 5...)
 */
export interface PluralForms {
  zero?: string
  one: string
  two?: string
  few?: string
  many?: string
  other?: string
}

// Cache for PluralRules instances per locale
const rulesCache = new Map<string, Intl.PluralRules>()

function getPluralRules(locale: string): Intl.PluralRules {
  const cached = rulesCache.get(locale)
  if (cached) return cached

  const rules = new Intl.PluralRules(locale)
  rulesCache.set(locale, rules)
  return rules
}

/**
 * Get the plural form for a number in a given locale
 */
export function getPluralCategory(count: number, locale: string): PluralCategory {
  const rules = getPluralRules(locale)
  return rules.select(count) as PluralCategory
}

/**
 * Pluralize a word based on count and locale
 *
 * @param count - The number to pluralize for
 * @param forms - Object with plural forms (one, few, many, other)
 * @param locale - Locale code (e.g., 'ru', 'en')
 * @param includeCount - Whether to include the number in the result (default: true)
 */
export function pluralize(
  count: number,
  forms: PluralForms,
  locale: string,
  includeCount = true
): string {
  const category = getPluralCategory(count, locale)

  // Find the appropriate form, with fallbacks
  let word: string
  switch (category) {
    case 'zero':
      word = forms.zero ?? forms.many ?? forms.other ?? forms.one
      break
    case 'one':
      word = forms.one
      break
    case 'two':
      word = forms.two ?? forms.few ?? forms.other ?? forms.one
      break
    case 'few':
      word = forms.few ?? forms.other ?? forms.one
      break
    case 'many':
      word = forms.many ?? forms.other ?? forms.one
      break
    case 'other':
    default:
      word = forms.other ?? forms.many ?? forms.one
      break
  }

  return includeCount ? `${count} ${word}` : word
}

/**
 * Create a reusable pluralizer function for a specific word
 *
 * @example
 * const nodesPlural = createPluralizer({
 *   one: 'узел',
 *   few: 'узла',
 *   many: 'узлов'
 * })
 *
 * nodesPlural(1, 'ru')  // "1 узел"
 * nodesPlural(3, 'ru')  // "3 узла"
 * nodesPlural(5, 'ru')  // "5 узлов"
 */
export function createPluralizer(forms: PluralForms) {
  return (count: number, locale: string, includeCount = true): string => {
    return pluralize(count, forms, locale, includeCount)
  }
}

/**
 * Create a pluralizer with different forms per locale
 *
 * @example
 * const itemsPlural = createLocalizedPluralizer({
 *   ru: { one: 'элемент', few: 'элемента', many: 'элементов' },
 *   en: { one: 'item', other: 'items' }
 * })
 *
 * itemsPlural(5, 'ru')  // "5 элементов"
 * itemsPlural(5, 'en')  // "5 items"
 */
export function createLocalizedPluralizer(
  formsByLocale: Record<string, PluralForms>,
  fallbackLocale = 'en'
) {
  return (count: number, locale: string, includeCount = true): string => {
    // Get base locale (e.g., 'ru' from 'ru-RU')
    const baseLocale = locale.split('-')[0]
    const forms = formsByLocale[baseLocale] ?? formsByLocale[fallbackLocale]

    if (!forms) {
      // If no forms found, just return the number
      return includeCount ? String(count) : ''
    }

    return pluralize(count, forms, baseLocale, includeCount)
  }
}

// ============================================================================
// Pre-built pluralizers for common words
// ============================================================================

/**
 * Pluralize "items/elements" (элементов)
 */
export const pluralizeItems = createLocalizedPluralizer({
  ru: { one: 'элемент', few: 'элемента', many: 'элементов' },
  en: { one: 'item', other: 'items' }
})

/**
 * Pluralize "nodes" (узлов)
 */
export const pluralizeNodes = createLocalizedPluralizer({
  ru: { one: 'узел', few: 'узла', many: 'узлов' },
  en: { one: 'node', other: 'nodes' }
})

/**
 * Pluralize "connections/edges" (связей)
 */
export const pluralizeEdges = createLocalizedPluralizer({
  ru: { one: 'связь', few: 'связи', many: 'связей' },
  en: { one: 'connection', other: 'connections' }
})

/**
 * Pluralize "maps" (карт)
 */
export const pluralizeMaps = createLocalizedPluralizer({
  ru: { one: 'карта', few: 'карты', many: 'карт' },
  en: { one: 'map', other: 'maps' }
})

/**
 * Pluralize "exercises" (упражнений)
 */
export const pluralizeExercises = createLocalizedPluralizer({
  ru: { one: 'упражнение', few: 'упражнения', many: 'упражнений' },
  en: { one: 'exercise', other: 'exercises' }
})
