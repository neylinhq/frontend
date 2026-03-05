/**
 * Rating system utilities for dual rating (ELO + Glicko-2)
 * Provides functions to work with node complexity ratings and user preferences
 */

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/** Read a CSS custom property value */
const getCssVarValue = (name: string): string => {
  if (!isBrowser) {
    return ''
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Convert OKLCH CSS variable to HEX */
const cssVarToHex = (varName: string): string => {
  if (!isBrowser) {
    return '#808080'
  }
  const oklchStr = getCssVarValue(`--${varName}`)
  if (!oklchStr) {
    return '#808080'
  }
  const parts = oklchStr.trim().split(/\s+/)
  if (parts.length < 3) {
    return '#808080'
  }
  const L = parseFloat(parts[0])
  const C = parseFloat(parts[1])
  const H = parseFloat(parts[2])
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const toSrgb = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(toSrgb(rLin))}${toHex(toSrgb(gLin))}${toHex(toSrgb(bLin))}`
}

// ============================================================================
// Types and Enums
// ============================================================================

export type RatingSystem = 'elo' | 'glicko'

export type RatingTier =
  | 'Novice'
  | 'Apprentice'
  | 'Journeyman'
  | 'Expert'
  | 'Master'
  | 'Grandmaster'
  | 'Legend'
  | 'Mythic'

export interface NodeRating {
  eloRating?: number | null
  eloTier?: string | null
  glickoRating?: number | null
  glickoTier?: string | null
}

export interface ActiveRating {
  rating: number | null
  tier: RatingTier | null
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Rating segments mapping (0-15000 scale)
 * Inspired by competitive game ranking systems (Dota 2 medals, chess titles)
 */
export const RATING_SEGMENTS = {
  Novice: { min: 0, max: 500 },
  Apprentice: { min: 500, max: 1500 },
  Journeyman: { min: 1500, max: 3000 },
  Expert: { min: 3000, max: 5000 },
  Master: { min: 5000, max: 7500 },
  Grandmaster: { min: 7500, max: 10000 },
  Legend: { min: 10000, max: 12500 },
  Mythic: { min: 12500, max: 15000 }
} as const

/**
 * Rating tier colors for visualization
 * Using Tailwind CSS custom properties
 */
export const RATING_TIER_COLORS: Record<RatingTier, string> = {
  Novice: 'bg-rating-novice/10 text-rating-novice',
  Apprentice: 'bg-rating-apprentice/10 text-rating-apprentice',
  Journeyman: 'bg-rating-journeyman/10 text-rating-journeyman',
  Expert: 'bg-rating-expert/10 text-rating-expert',
  Master: 'bg-rating-master/10 text-rating-master',
  Grandmaster: 'bg-rating-grandmaster/10 text-rating-grandmaster',
  Legend: 'bg-rating-legend/10 text-rating-legend',
  Mythic: 'bg-rating-mythic/10 text-rating-mythic'
}

/**
 * Get rating tier hex color from CSS variables - adapts to current theme
 * SSR-safe: returns fallback color from RATING_TIER_HEX_COLORS in SSR
 */
export const getRatingTierHexColor = (tier: RatingTier): string => {
  const tierKey = tier.toLowerCase()
  const color = cssVarToHex(`rating-${tierKey}`)
  // cssVarToHex returns #808080 in SSR - use static fallback instead
  if (color === '#808080') {
    return RATING_TIER_HEX_COLORS[tier] ?? '#808080'
  }
  return color
}

/**
 * @deprecated Use getRatingTierHexColor(tier) instead for theme-aware colors
 * Rating tier hex colors for inline styles (static fallback)
 */
export const RATING_TIER_HEX_COLORS: Record<RatingTier, string> = {
  Novice: '#6b7280',
  Apprentice: '#3b82f6',
  Journeyman: '#22c55e',
  Expert: '#eab308',
  Master: '#f97316',
  Grandmaster: '#ef4444',
  Legend: '#a855f7',
  Mythic: '#ec4899'
}

export interface TierInfo {
  name: RatingTier
  color: string
  colorClass: string
}

/**
 * Rating tier border colors for nodes
 */
export const RATING_TIER_BORDER_COLORS: Record<RatingTier, string> = {
  Novice: 'border-rating-novice',
  Apprentice: 'border-rating-apprentice',
  Journeyman: 'border-rating-journeyman',
  Expert: 'border-rating-expert',
  Master: 'border-rating-master',
  Grandmaster: 'border-rating-grandmaster',
  Legend: 'border-rating-legend',
  Mythic: 'border-rating-mythic'
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Calculate rating tier from complexity value (0-15000 scale)
 * Returns TierInfo with name, hex color, and tailwind class
 */
export const getComplexityTier = (complexity: number | null | undefined): TierInfo | null => {
  if (complexity === null || complexity === undefined) {
    return null
  }

  // Find tier by checking which range the complexity falls into
  for (const [tierName, range] of Object.entries(RATING_SEGMENTS)) {
    if (complexity >= range.min && complexity <= range.max) {
      const tier = tierName as RatingTier
      return {
        name: tier,
        color: getRatingTierHexColor(tier),
        colorClass: RATING_TIER_COLORS[tier]
      }
    }
  }

  return null
}

/**
 * Get just the tier name from complexity (for backward compatibility)
 */
export const getComplexityTierName = (complexity: number | null | undefined): RatingTier | null => {
  const tier = getComplexityTier(complexity)
  return tier?.name ?? null
}

/**
 * Get active rating based on user's preferred rating system
 */
export const getActiveRating = (
  node: NodeRating,
  preferredSystem: RatingSystem = 'elo'
): ActiveRating => {
  if (preferredSystem === 'elo') {
    return {
      rating: node.eloRating ?? null,
      tier: (node.eloTier as RatingTier) ?? null
    }
  }

  return {
    rating: node.glickoRating ?? null,
    tier: (node.glickoTier as RatingTier) ?? null
  }
}

/**
 * Get color class for rating tier badge
 */
export const getRatingTierColor = (tier: RatingTier | string | null): string => {
  if (!tier) {
    return 'bg-muted text-muted-foreground'
  }

  return RATING_TIER_COLORS[tier as RatingTier] ?? 'bg-muted text-muted-foreground'
}

/**
 * Get border color class for rating tier
 */
export const getRatingTierBorderColor = (tier: RatingTier | string | null): string => {
  if (!tier) {
    return 'border-border'
  }

  return RATING_TIER_BORDER_COLORS[tier as RatingTier] ?? 'border-border'
}

/**
 * Check if node has any rating calibrated
 */
export const hasRating = (node: NodeRating): boolean => {
  return !!(node.eloRating || node.glickoRating)
}

/**
 * Check if node has specific rating system calibrated
 */
export const hasRatingSystem = (node: NodeRating, system: RatingSystem): boolean => {
  if (system === 'elo') {
    return node.eloRating !== null && node.eloRating !== undefined
  }
  return node.glickoRating !== null && node.glickoRating !== undefined
}

/**
 * Get rating progress within current tier (0.0 - 1.0)
 */
export const getRatingProgress = (rating: number | null, tier: RatingTier | null): number => {
  if (!rating || !tier) {
    return 0
  }

  const segment = RATING_SEGMENTS[tier]
  if (!segment) {
    return 0
  }

  const rangeSize = segment.max - segment.min
  if (rangeSize === 0) {
    return 1
  }

  const progress = (rating - segment.min) / rangeSize
  return Math.max(0, Math.min(1, progress))
}

/**
 * Format rating display (e.g., "1500 ELO" or "2000 Glicko")
 */
export const formatRating = (rating: number | null, system: RatingSystem): string => {
  if (rating === null || rating === undefined) {
    return 'Not calibrated'
  }

  const systemLabel = system === 'elo' ? 'ELO' : 'Glicko'
  return `${rating} ${systemLabel}`
}

/**
 * Get localized rating system name
 */
export const getRatingSystemLabel = (system: RatingSystem): string => {
  return system === 'elo' ? 'ELO Rating' : 'Glicko-2 Rating'
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate rating value (0-15000)
 */
export const isValidRating = (rating: number): boolean => {
  return rating >= 0 && rating <= 15000
}

/**
 * Validate rating tier name
 */
export const isValidTier = (tier: string): tier is RatingTier => {
  return tier in RATING_SEGMENTS
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get all available rating tiers in order
 */
export const getAllTiers = (): RatingTier[] => {
  return Object.keys(RATING_SEGMENTS) as RatingTier[]
}

/**
 * Get tier index (0-7, for sorting)
 */
export const getTierIndex = (tier: RatingTier | string | null): number => {
  if (!tier) return -1
  const tiers = getAllTiers()
  return tiers.indexOf(tier as RatingTier)
}

/**
 * Compare two rating tiers
 * Returns: -1 if tier1 < tier2, 0 if equal, 1 if tier1 > tier2
 */
export const compareTiers = (
  tier1: RatingTier | string | null,
  tier2: RatingTier | string | null
): number => {
  const index1 = getTierIndex(tier1)
  const index2 = getTierIndex(tier2)

  if (index1 < index2) return -1
  if (index1 > index2) return 1
  return 0
}
