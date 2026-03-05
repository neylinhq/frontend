import type { TFunction } from 'i18next'

import type { RelationType } from '@/entities/edge'

/**
 * Edge Type Translations Cache
 *
 * PERFORMANCE OPTIMIZATION:
 * Instead of calling t() in each edge component (1000+ times per render),
 * we pre-compute all translations once and reuse them.
 *
 * This eliminates i18n hook overhead from edge components entirely.
 */

export type EdgeTranslations = Record<RelationType, string>

let cachedTranslations: EdgeTranslations | null = null
let cachedLanguage: string | null = null

const RELATION_TYPES: RelationType[] = [
  'is-a',
  'has-a',
  'causes',
  'explains',
  'related-to',
  'influences',
  'part-of',
  'prerequisite',
  'contradicts',
  'similar-to'
]

/**
 * Get cached edge type translations.
 * Regenerates cache only when language changes.
 */
export const getEdgeTranslations = (t: TFunction, language: string): EdgeTranslations => {
  if (cachedTranslations && cachedLanguage === language) {
    return cachedTranslations
  }

  cachedTranslations = {} as EdgeTranslations
  for (const type of RELATION_TYPES) {
    cachedTranslations[type] = t(`graph.edgeTypes.${type}`)
  }
  cachedLanguage = language

  return cachedTranslations
}

/**
 * Get single edge type translation from cache.
 * Falls back to type name if not in cache.
 */
export const getEdgeTypeLabel = (
  translations: EdgeTranslations,
  relationType: RelationType
): string => {
  return translations[relationType] ?? relationType
}
