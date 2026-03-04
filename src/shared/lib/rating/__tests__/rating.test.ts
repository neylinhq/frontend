import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RatingTier } from '..'

let cssVarToHex: typeof import('@/features/graph-webgl/lib/theme-bridge').cssVarToHex
let rating: typeof import('..')

beforeEach(async () => {
  vi.resetModules()
  vi.doMock('@/features/graph-webgl/lib/theme-bridge', () => ({
    cssVarToHex: vi.fn(() => '#808080')
  }))
  ;({ cssVarToHex } = await import('@/features/graph-webgl/lib/theme-bridge'))
  rating = await import('..')
})

describe('rating utilities', () => {
  it('returns null for undefined complexity', () => {
    expect(rating.getComplexityTier(null)).toBeNull()
    expect(rating.getComplexityTierName(null)).toBeNull()
  })

  it('maps complexity to tier and uses fallback color', () => {
    const tier = rating.getComplexityTier(250)
    expect(tier?.name).toBe('Novice')
    expect(tier?.color).toBe('#6b7280')
  })

  it('returns null for out-of-range complexity', () => {
    expect(rating.getComplexityTier(-1)).toBeNull()
  })

  it('exposes tier name helper', () => {
    expect(rating.getComplexityTierName(2000)).toBe('Journeyman')
  })

  it('handles rating system selection', () => {
    const node = { eloRating: 1500, eloTier: 'Expert', glickoRating: 2000, glickoTier: 'Master' }
    expect(rating.getActiveRating(node, 'elo')).toEqual({ rating: 1500, tier: 'Expert' })
    expect(rating.getActiveRating(node, 'glicko')).toEqual({ rating: 2000, tier: 'Master' })
  })

  it('defaults to null ratings when values are missing', () => {
    const node = {}
    expect(rating.getActiveRating(node, 'elo')).toEqual({ rating: null, tier: null })
    expect(rating.getActiveRating(node, 'glicko')).toEqual({ rating: null, tier: null })
  })

  it('calculates rating progress within tier', () => {
    expect(rating.getRatingProgress(250, 'Novice')).toBe(0.5)
    expect(rating.getRatingProgress(null, 'Novice')).toBe(0)
    expect(rating.getRatingProgress(0, 'Novice')).toBe(0)
    expect(rating.getRatingProgress(100, 'Unknown' as RatingTier)).toBe(0)
  })

  it('returns full progress when tier range is zero', () => {
    const segments = rating.RATING_SEGMENTS as Record<string, { min: number; max: number }>
    const original = { ...segments.Novice }
    segments.Novice.max = segments.Novice.min

    expect(rating.getRatingProgress(1, 'Novice')).toBe(1)
    segments.Novice.max = original.max
  })

  it('formats rating values', () => {
    expect(rating.formatRating(1500, 'elo')).toBe('1500 ELO')
    expect(rating.formatRating(null, 'glicko')).toBe('Not calibrated')
    expect(rating.formatRating(2000, 'glicko')).toBe('2000 Glicko')
  })

  it('handles color helpers', () => {
    expect(rating.getRatingTierColor(null)).toBe('bg-muted text-muted-foreground')
    expect(rating.getRatingTierColor('Unknown')).toBe('bg-muted text-muted-foreground')
    expect(rating.getRatingTierBorderColor(null)).toBe('border-border')
    expect(rating.getRatingTierBorderColor('Novice')).toBe('border-rating-novice')
    expect(rating.getRatingTierBorderColor('Unknown')).toBe('border-border')
  })

  it('validates rating values and tiers', () => {
    expect(rating.isValidRating(0)).toBe(true)
    expect(rating.isValidRating(16000)).toBe(false)
    expect(rating.isValidTier('Novice')).toBe(true)
    expect(rating.isValidTier('Invalid')).toBe(false)
  })

  it('detects rated nodes', () => {
    expect(rating.hasRating({ eloRating: 0 })).toBe(false)
    expect(rating.hasRating({ eloRating: 1200 })).toBe(true)
    expect(rating.hasRating({ glickoRating: 1200 })).toBe(true)
    expect(rating.hasRatingSystem({ eloRating: 0 }, 'elo')).toBe(true)
    expect(rating.hasRatingSystem({ glickoRating: null }, 'glicko')).toBe(false)
    expect(rating.hasRatingSystem({ glickoRating: 1500 }, 'glicko')).toBe(true)
  })

  it('returns label per system', () => {
    expect(rating.getRatingSystemLabel('elo')).toBe('ELO Rating')
    expect(rating.getRatingSystemLabel('glicko')).toBe('Glicko-2 Rating')
  })

  it('uses cssVarToHex when available', () => {
    const mocked = vi.mocked(cssVarToHex)
    mocked.mockReturnValue('#123456')
    const tier = rating.getComplexityTier(250)
    expect(tier?.color).toBe('#123456')
  })

  it('falls back to default hex when tier is unknown', () => {
    expect(rating.getRatingTierHexColor('Unknown' as RatingTier)).toBe('#808080')
  })

  it('orders tiers with helper utilities', () => {
    expect(rating.getTierIndex(null)).toBe(-1)
    expect(rating.compareTiers('Novice', 'Expert')).toBe(-1)
    expect(rating.compareTiers('Expert', 'Novice')).toBe(1)
    expect(rating.compareTiers('Novice', 'Novice')).toBe(0)
  })
})
