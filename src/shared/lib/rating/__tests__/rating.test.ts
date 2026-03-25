import { describe, expect, it } from 'vitest'
import * as rating from '../rating'

describe('rating (complexity tier utilities)', () => {
  describe('getComplexityTier', () => {
    it('returns null for null/undefined', () => {
      expect(rating.getComplexityTier(null)).toBeNull()
      expect(rating.getComplexityTier(undefined)).toBeNull()
    })

    it('maps complexity to correct tier', () => {
      expect(rating.getComplexityTier(200)?.name).toBe('Novice')
      expect(rating.getComplexityTier(1000)?.name).toBe('Apprentice')
      expect(rating.getComplexityTier(2000)?.name).toBe('Journeyman')
      expect(rating.getComplexityTier(4000)?.name).toBe('Expert')
      expect(rating.getComplexityTier(6000)?.name).toBe('Master')
      expect(rating.getComplexityTier(9000)?.name).toBe('Grandmaster')
      expect(rating.getComplexityTier(11000)?.name).toBe('Legend')
      expect(rating.getComplexityTier(14000)?.name).toBe('Mythic')
    })
  })

  describe('getComplexityTierName', () => {
    it('returns tier name from complexity', () => {
      expect(rating.getComplexityTierName(200)).toBe('Novice')
      expect(rating.getComplexityTierName(null)).toBeNull()
    })
  })

  describe('getComplexityProgress', () => {
    it('returns progress within tier', () => {
      expect(rating.getComplexityProgress(250, 'Novice')).toBeCloseTo(0.5)
    })

    it('returns 0 for null inputs', () => {
      expect(rating.getComplexityProgress(null, null)).toBe(0)
    })
  })

  describe('validation', () => {
    it('validates complexity range', () => {
      expect(rating.isValidComplexity(0)).toBe(true)
      expect(rating.isValidComplexity(15000)).toBe(true)
      expect(rating.isValidComplexity(-1)).toBe(false)
      expect(rating.isValidComplexity(15001)).toBe(false)
    })

    it('validates tier names', () => {
      expect(rating.isValidTier('Novice')).toBe(true)
      expect(rating.isValidTier('invalid')).toBe(false)
    })
  })

  describe('tier utilities', () => {
    it('getAllTiers returns all 8 tiers', () => {
      expect(rating.getAllTiers()).toHaveLength(8)
    })

    it('compareTiers orders correctly', () => {
      expect(rating.compareTiers('Novice', 'Mythic')).toBe(-1)
      expect(rating.compareTiers('Mythic', 'Novice')).toBe(1)
      expect(rating.compareTiers('Expert', 'Expert')).toBe(0)
    })

    it('getTierIndex returns correct index', () => {
      expect(rating.getTierIndex('Novice')).toBe(0)
      expect(rating.getTierIndex('Mythic')).toBe(7)
      expect(rating.getTierIndex(null)).toBe(-1)
    })
  })

  describe('deprecated aliases', () => {
    it('RATING_SEGMENTS equals COMPLEXITY_SEGMENTS', () => {
      expect(rating.RATING_SEGMENTS).toBe(rating.COMPLEXITY_SEGMENTS)
    })

    it('getRatingTierColor equals getComplexityTierColor', () => {
      expect(rating.getRatingTierColor).toBe(rating.getComplexityTierColor)
    })
  })
})
