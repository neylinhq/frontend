/**
 * Node complexity tier utilities (0-15000 scale)
 * Used for visual representation of node difficulty on the graph
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
// Types
// ============================================================================

export type ComplexityTier =
  | 'Novice'
  | 'Apprentice'
  | 'Journeyman'
  | 'Expert'
  | 'Master'
  | 'Grandmaster'
  | 'Legend'
  | 'Mythic'

/** @deprecated Use ComplexityTier instead */
export type RatingTier = ComplexityTier

export interface TierInfo {
  name: ComplexityTier
  color: string
  colorClass: string
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Complexity segments mapping (0-15000 scale)
 * Used for node difficulty visualization
 */
export const COMPLEXITY_SEGMENTS = {
  Novice: { min: 0, max: 500 },
  Apprentice: { min: 500, max: 1500 },
  Journeyman: { min: 1500, max: 3000 },
  Expert: { min: 3000, max: 5000 },
  Master: { min: 5000, max: 7500 },
  Grandmaster: { min: 7500, max: 10000 },
  Legend: { min: 10000, max: 12500 },
  Mythic: { min: 12500, max: 15000 }
} as const

/** @deprecated Use COMPLEXITY_SEGMENTS */
export const RATING_SEGMENTS = COMPLEXITY_SEGMENTS

export const COMPLEXITY_TIER_COLORS: Record<ComplexityTier, string> = {
  Novice: 'bg-rating-novice/10 text-rating-novice',
  Apprentice: 'bg-rating-apprentice/10 text-rating-apprentice',
  Journeyman: 'bg-rating-journeyman/10 text-rating-journeyman',
  Expert: 'bg-rating-expert/10 text-rating-expert',
  Master: 'bg-rating-master/10 text-rating-master',
  Grandmaster: 'bg-rating-grandmaster/10 text-rating-grandmaster',
  Legend: 'bg-rating-legend/10 text-rating-legend',
  Mythic: 'bg-rating-mythic/10 text-rating-mythic'
}

/** @deprecated Use COMPLEXITY_TIER_COLORS */
export const RATING_TIER_COLORS = COMPLEXITY_TIER_COLORS

export const COMPLEXITY_TIER_HEX_COLORS: Record<ComplexityTier, string> = {
  Novice: '#6b7280',
  Apprentice: '#3b82f6',
  Journeyman: '#22c55e',
  Expert: '#eab308',
  Master: '#f97316',
  Grandmaster: '#ef4444',
  Legend: '#a855f7',
  Mythic: '#ec4899'
}

/** @deprecated Use COMPLEXITY_TIER_HEX_COLORS */
export const RATING_TIER_HEX_COLORS = COMPLEXITY_TIER_HEX_COLORS

export const COMPLEXITY_TIER_BORDER_COLORS: Record<ComplexityTier, string> = {
  Novice: 'border-rating-novice',
  Apprentice: 'border-rating-apprentice',
  Journeyman: 'border-rating-journeyman',
  Expert: 'border-rating-expert',
  Master: 'border-rating-master',
  Grandmaster: 'border-rating-grandmaster',
  Legend: 'border-rating-legend',
  Mythic: 'border-rating-mythic'
}

/** @deprecated Use COMPLEXITY_TIER_BORDER_COLORS */
export const RATING_TIER_BORDER_COLORS = COMPLEXITY_TIER_BORDER_COLORS

// ============================================================================
// Core Functions
// ============================================================================

export const getComplexityTierHexColor = (tier: ComplexityTier): string => {
  const tierKey = tier.toLowerCase()
  const color = cssVarToHex(`rating-${tierKey}`)
  if (color === '#808080') {
    return COMPLEXITY_TIER_HEX_COLORS[tier] ?? '#808080'
  }
  return color
}

/** @deprecated Use getComplexityTierHexColor */
export const getRatingTierHexColor = getComplexityTierHexColor

export const getComplexityTier = (complexity: number | null | undefined): TierInfo | null => {
  if (complexity === null || complexity === undefined) {
    return null
  }

  for (const [tierName, range] of Object.entries(COMPLEXITY_SEGMENTS)) {
    if (complexity >= range.min && complexity <= range.max) {
      const tier = tierName as ComplexityTier
      return {
        name: tier,
        color: getComplexityTierHexColor(tier),
        colorClass: COMPLEXITY_TIER_COLORS[tier]
      }
    }
  }

  return null
}

export const getComplexityTierName = (complexity: number | null | undefined): ComplexityTier | null => {
  const tier = getComplexityTier(complexity)
  return tier?.name ?? null
}

export const getComplexityTierColor = (tier: ComplexityTier | string | null): string => {
  if (!tier) {
    return 'bg-muted text-muted-foreground'
  }
  return COMPLEXITY_TIER_COLORS[tier as ComplexityTier] ?? 'bg-muted text-muted-foreground'
}

/** @deprecated Use getComplexityTierColor */
export const getRatingTierColor = getComplexityTierColor

export const getComplexityTierBorderColor = (tier: ComplexityTier | string | null): string => {
  if (!tier) {
    return 'border-border'
  }
  return COMPLEXITY_TIER_BORDER_COLORS[tier as ComplexityTier] ?? 'border-border'
}

/** @deprecated Use getComplexityTierBorderColor */
export const getRatingTierBorderColor = getComplexityTierBorderColor

export const getComplexityProgress = (complexity: number | null, tier: ComplexityTier | null): number => {
  if (!complexity || !tier) {
    return 0
  }

  const segment = COMPLEXITY_SEGMENTS[tier]
  if (!segment) {
    return 0
  }

  const rangeSize = segment.max - segment.min
  if (rangeSize === 0) {
    return 1
  }

  const progress = (complexity - segment.min) / rangeSize
  return Math.max(0, Math.min(1, progress))
}

/** @deprecated Use getComplexityProgress */
export const getRatingProgress = getComplexityProgress

// ============================================================================
// Validation & Utilities
// ============================================================================

export const isValidComplexity = (value: number): boolean => {
  return value >= 0 && value <= 15000
}

/** @deprecated Use isValidComplexity */
export const isValidRating = isValidComplexity

export const isValidTier = (tier: string): tier is ComplexityTier => {
  return tier in COMPLEXITY_SEGMENTS
}

export const getAllTiers = (): ComplexityTier[] => {
  return Object.keys(COMPLEXITY_SEGMENTS) as ComplexityTier[]
}

export const getTierIndex = (tier: ComplexityTier | string | null): number => {
  if (!tier) return -1
  const tiers = getAllTiers()
  return tiers.indexOf(tier as ComplexityTier)
}

export const compareTiers = (
  tier1: ComplexityTier | string | null,
  tier2: ComplexityTier | string | null
): number => {
  const index1 = getTierIndex(tier1)
  const index2 = getTierIndex(tier2)

  if (index1 < index2) return -1
  if (index1 > index2) return 1
  return 0
}
