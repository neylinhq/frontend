import { describe, expect, it, vi } from 'vitest'

import { getEdgeTranslations, getEdgeTypeLabel } from '../lib/edge-translations'

describe('edge translations', () => {
  it('caches translations per language', () => {
    const t = vi.fn((key: string) => key)
    const first = getEdgeTranslations(t, 'en')
    const second = getEdgeTranslations(t, 'en')
    expect(first).toBe(second)
    expect(t).toHaveBeenCalled()
  })

  it('returns cached labels', () => {
    const t = (key: string) => `translated:${key}`
    const translations = getEdgeTranslations(t, 'ru')
    expect(translations['related-to']).toBe('translated:graph.edgeTypes.related-to')
    expect(getEdgeTypeLabel(translations, 'related-to')).toBe(
      'translated:graph.edgeTypes.related-to'
    )
  })

  it('recomputes cache when language changes', () => {
    const t = vi.fn((key: string) => key)
    const first = getEdgeTranslations(t, 'en')
    const second = getEdgeTranslations(t, 'ru')
    expect(first).not.toBe(second)
  })

  it('falls back to relation type when missing', () => {
    const translations = { 'related-to': 'ok' } as ReturnType<typeof getEdgeTranslations>
    expect(getEdgeTypeLabel(translations, 'causes')).toBe('causes')
  })
})
