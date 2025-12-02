import type { RelationType } from '../model/edge.schema'

/**
 * S+ Elite Semantic Edge Color System
 * Consolidates 10 edge types into 4 semantic groups:
 * - Knowledge (structural): prerequisite, is-a, has-a, part-of
 * - Question (causal): causes, explains, influences
 * - Neutral (associative): related-to, similar-to
 * - Conflict: contradicts
 *
 * Uses CSS variables for palette-adaptive colors
 */

// Semantic group mapping
type SemanticGroup = 'knowledge' | 'question' | 'neutral' | 'conflict'

const EDGE_SEMANTIC_GROUP: Record<RelationType, SemanticGroup> = {
  // Structural/foundational relations → Knowledge (blue)
  prerequisite: 'knowledge',
  'is-a': 'knowledge',
  'has-a': 'knowledge',
  'part-of': 'knowledge',
  // Causal/reasoning relations → Question (purple)
  causes: 'question',
  explains: 'question',
  influences: 'question',
  // Associative relations → Neutral (gray)
  'related-to': 'neutral',
  'similar-to': 'neutral',
  // Conflict relations → Conflict (red)
  contradicts: 'conflict'
}

// CSS variable for SVG stroke (uses hsl(var(...)) syntax)
export const EDGE_STROKE_COLORS: Record<RelationType, string> = {
  prerequisite: 'hsl(var(--semantic-knowledge))',
  'is-a': 'hsl(var(--semantic-knowledge))',
  'has-a': 'hsl(var(--semantic-knowledge))',
  'part-of': 'hsl(var(--semantic-knowledge))',
  causes: 'hsl(var(--semantic-question))',
  explains: 'hsl(var(--semantic-question))',
  influences: 'hsl(var(--semantic-question))',
  'related-to': 'hsl(var(--semantic-neutral))',
  'similar-to': 'hsl(var(--semantic-neutral))',
  contradicts: 'hsl(var(--semantic-conflict))'
}

// Tailwind classes for badge - using semantic colors
export const EDGE_BADGE_CLASSES: Record<RelationType, string> = {
  // Knowledge group
  prerequisite: 'bg-semantic-knowledge-muted text-semantic-knowledge border-transparent',
  'is-a': 'bg-semantic-knowledge-muted text-semantic-knowledge border-transparent',
  'has-a': 'bg-semantic-knowledge-muted text-semantic-knowledge border-transparent',
  'part-of': 'bg-semantic-knowledge-muted text-semantic-knowledge border-transparent',
  // Question group
  causes: 'bg-semantic-question-muted text-semantic-question border-transparent',
  explains: 'bg-semantic-question-muted text-semantic-question border-transparent',
  influences: 'bg-semantic-question-muted text-semantic-question border-transparent',
  // Neutral group
  'related-to': 'bg-semantic-neutral-muted text-semantic-neutral border-transparent',
  'similar-to': 'bg-semantic-neutral-muted text-semantic-neutral border-transparent',
  // Conflict group
  contradicts: 'bg-semantic-conflict-muted text-semantic-conflict border-transparent'
}

export const getEdgeStrokeColor = (type: RelationType) =>
  EDGE_STROKE_COLORS[type] || 'hsl(var(--semantic-neutral))'

export const getEdgeBadgeClass = (type: RelationType) =>
  EDGE_BADGE_CLASSES[type] || 'bg-semantic-neutral-muted text-semantic-neutral border-transparent'

export const getEdgeSemanticGroup = (type: RelationType): SemanticGroup =>
  EDGE_SEMANTIC_GROUP[type] || 'neutral'
