import type { NodeType } from '../node.schema'
import { getRatingTierColor, getRatingTierBorderColor, type RatingTier } from '@/shared/lib/rating'

/**
 * Node Type Color System - 8 unique hues
 * Each node type has its own distinct color for visual identification.
 * Uses CSS variables that adapt to palette (mono/classic/vanilla/vivid)
 *
 * Hue mapping:
 * - concept:    240° Blue      - abstract knowledge
 * - theory:     265° Indigo    - deep theoretical framework
 * - fact:       145° Green     - verified information
 * - example:     55° Orange    - practical demonstration
 * - question:   290° Purple    - unknown/inquiry
 * - hypothesis: 315° Magenta   - speculation/untested
 * - person:      25° Coral     - human entity (warm)
 * - school:     195° Cyan      - institution/organization
 */
export const getNodeBorderColor = (type: NodeType): string => {
  const colors: Record<NodeType, string> = {
    concept: 'border-l-node-concept',
    theory: 'border-l-node-theory',
    fact: 'border-l-node-fact',
    example: 'border-l-node-example',
    question: 'border-l-node-question',
    hypothesis: 'border-l-node-hypothesis',
    person: 'border-l-node-person',
    school: 'border-l-node-school'
  }
  return colors[type] || 'border-l-semantic-neutral'
}

/**
 * Background color for LOD view (zoomed out)
 * Uses muted node colors for softer appearance
 */
export const getNodeBgColor = (type: NodeType): string => {
  const colors: Record<NodeType, string> = {
    concept: 'bg-node-concept-muted',
    theory: 'bg-node-theory-muted',
    fact: 'bg-node-fact-muted',
    example: 'bg-node-example-muted',
    question: 'bg-node-question-muted',
    hypothesis: 'bg-node-hypothesis-muted',
    person: 'bg-node-person-muted',
    school: 'bg-node-school-muted'
  }
  return colors[type] || 'bg-semantic-neutral-muted'
}

/**
 * Complexity colors using semantic system (DEPRECATED - use getRatingTierColor instead)
 * - Basic: Neutral (gray)
 * - Intermediate: Knowledge (blue)
 * - Advanced: Conflict (red) - signals difficulty
 * @deprecated Use getRatingTierColor from @/shared/lib/rating instead
 */
export const getComplexityColor = (complexity?: 'basic' | 'intermediate' | 'advanced'): string => {
  if (!complexity) {
    return ''
  }

  const colors = {
    basic: 'bg-complexity-basic-bg text-complexity-basic',
    intermediate: 'bg-complexity-intermediate-bg text-complexity-intermediate',
    advanced: 'bg-complexity-advanced-bg text-complexity-advanced'
  }
  return colors[complexity]
}

/**
 * Get badge color classes for rating tier
 * Re-exports from shared/lib/rating for convenience
 */
export const getRatingColor = (tier: RatingTier | string | null): string => {
  return getRatingTierColor(tier)
}

/**
 * Get border color classes for rating tier
 * Re-exports from shared/lib/rating for convenience
 */
export const getRatingBorderColor = (tier: RatingTier | string | null): string => {
  return getRatingTierBorderColor(tier)
}
