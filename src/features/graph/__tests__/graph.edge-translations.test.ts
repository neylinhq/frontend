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
    expect(getEdgeTypeLabel(translations, 'related-to')).toBe('translated:graph.edgeTypes.related-to')
  })
})
