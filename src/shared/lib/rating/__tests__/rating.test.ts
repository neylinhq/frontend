import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/graph-webgl/lib/theme-bridge', () => ({
  cssVarToHex: vi.fn(() => '#808080')
}))

import { cssVarToHex } from '@/features/graph-webgl/lib/theme-bridge'
import {
  formatRating,
  getActiveRating,
  getComplexityTier,
  getComplexityTierName,
  getRatingProgress,
  getRatingSystemLabel,
  getRatingTierBorderColor,
  getRatingTierColor,
  hasRating,
  hasRatingSystem,
  isValidRating,
  isValidTier
} from '..'

describe('rating utilities', () => {
  it('returns null for undefined complexity', () => {
    expect(getComplexityTier(null)).toBeNull()
  })

  it('maps complexity to tier and uses fallback color', () => {
    const tier = getComplexityTier(250)
    expect(tier?.name).toBe('Novice')
    expect(tier?.color).toBe('#6b7280')
  })

  it('exposes tier name helper', () => {
    expect(getComplexityTierName(2000)).toBe('Journeyman')
  })

  it('handles rating system selection', () => {
    const node = { eloRating: 1500, eloTier: 'Expert', glickoRating: 2000, glickoTier: 'Master' }
    expect(getActiveRating(node, 'elo')).toEqual({ rating: 1500, tier: 'Expert' })
    expect(getActiveRating(node, 'glicko')).toEqual({ rating: 2000, tier: 'Master' })
  })

  it('calculates rating progress within tier', () => {
    expect(getRatingProgress(250, 'Novice')).toBe(0.5)
    expect(getRatingProgress(null, 'Novice')).toBe(0)
  })

  it('formats rating values', () => {
    expect(formatRating(1500, 'elo')).toBe('1500 ELO')
    expect(formatRating(null, 'glicko')).toBe('Not calibrated')
  })

  it('handles color helpers', () => {
    expect(getRatingTierColor(null)).toBe('bg-muted text-muted-foreground')
    expect(getRatingTierBorderColor('Novice')).toBe('border-rating-novice')
  })

  it('validates rating values and tiers', () => {
    expect(isValidRating(0)).toBe(true)
    expect(isValidRating(16000)).toBe(false)
    expect(isValidTier('Novice')).toBe(true)
    expect(isValidTier('Invalid')).toBe(false)
  })

  it('detects rated nodes', () => {
    expect(hasRating({ eloRating: 0 })).toBe(false)
    expect(hasRating({ glickoRating: 1200 })).toBe(true)
    expect(hasRatingSystem({ eloRating: 0 }, 'elo')).toBe(true)
    expect(hasRatingSystem({ glickoRating: null }, 'glicko')).toBe(false)
  })

  it('returns label per system', () => {
    expect(getRatingSystemLabel('elo')).toBe('ELO Rating')
    expect(getRatingSystemLabel('glicko')).toBe('Glicko-2 Rating')
  })

  it('uses cssVarToHex when available', () => {
    const mocked = vi.mocked(cssVarToHex)
    mocked.mockReturnValue('#123456')
    const tier = getComplexityTier(250)
    expect(tier?.color).toBe('#123456')
  })
})
