import type { RelationType } from '../model/edge.schema'

/**
 * Edge Color System
 * Each edge type has its own unique color that adapts to the palette.
 * Colors are defined in globals.css as --edge-{type} variables.
 */

// CSS variable for SVG stroke - each type has unique color
export const EDGE_STROKE_COLORS: Record<RelationType, string> = {
  prerequisite: 'hsl(var(--edge-prerequisite))',
  causes: 'hsl(var(--edge-causes))',
  explains: 'hsl(var(--edge-explains))',
  'is-a': 'hsl(var(--edge-is-a))',
  'has-a': 'hsl(var(--edge-has-a))',
  'part-of': 'hsl(var(--edge-part-of))',
  influences: 'hsl(var(--edge-influences))',
  'related-to': 'hsl(var(--edge-related-to))',
  contradicts: 'hsl(var(--edge-contradicts))',
  'similar-to': 'hsl(var(--edge-similar-to))'
}

// Tailwind classes for badge background - using registered edge colors
export const EDGE_BG_CLASSES: Record<RelationType, string> = {
  prerequisite: 'bg-edge-prerequisite-muted',
  causes: 'bg-edge-causes-muted',
  explains: 'bg-edge-explains-muted',
  'is-a': 'bg-edge-is-a-muted',
  'has-a': 'bg-edge-has-a-muted',
  'part-of': 'bg-edge-part-of-muted',
  influences: 'bg-edge-influences-muted',
  'related-to': 'bg-edge-related-to-muted',
  contradicts: 'bg-edge-contradicts-muted',
  'similar-to': 'bg-edge-similar-to-muted'
}

// Tailwind classes for badge background with opacity variants (for buttons/selectors)
// Uses main edge color with 15% opacity (unselected) or 25% (hover/selected)
export const EDGE_BG_LIGHT_CLASSES: Record<RelationType, string> = {
  prerequisite: 'bg-edge-prerequisite/15',
  causes: 'bg-edge-causes/15',
  explains: 'bg-edge-explains/15',
  'is-a': 'bg-edge-is-a/15',
  'has-a': 'bg-edge-has-a/15',
  'part-of': 'bg-edge-part-of/15',
  influences: 'bg-edge-influences/15',
  'related-to': 'bg-edge-related-to/15',
  contradicts: 'bg-edge-contradicts/15',
  'similar-to': 'bg-edge-similar-to/15'
}

export const EDGE_BG_MEDIUM_CLASSES: Record<RelationType, string> = {
  prerequisite: 'bg-edge-prerequisite/25',
  causes: 'bg-edge-causes/25',
  explains: 'bg-edge-explains/25',
  'is-a': 'bg-edge-is-a/25',
  'has-a': 'bg-edge-has-a/25',
  'part-of': 'bg-edge-part-of/25',
  influences: 'bg-edge-influences/25',
  'related-to': 'bg-edge-related-to/25',
  contradicts: 'bg-edge-contradicts/25',
  'similar-to': 'bg-edge-similar-to/25'
}

// Tailwind classes for badge text - using registered edge colors
export const EDGE_TEXT_CLASSES: Record<RelationType, string> = {
  prerequisite: 'text-edge-prerequisite',
  causes: 'text-edge-causes',
  explains: 'text-edge-explains',
  'is-a': 'text-edge-is-a',
  'has-a': 'text-edge-has-a',
  'part-of': 'text-edge-part-of',
  influences: 'text-edge-influences',
  'related-to': 'text-edge-related-to',
  contradicts: 'text-edge-contradicts',
  'similar-to': 'text-edge-similar-to'
}

export const getEdgeStrokeColor = (type: RelationType) =>
  EDGE_STROKE_COLORS[type] || 'hsl(var(--edge-related-to))'

export const getEdgeBgClass = (type: RelationType) =>
  EDGE_BG_CLASSES[type] || 'bg-edge-related-to-muted'

export const getEdgeBgLightClass = (type: RelationType) =>
  EDGE_BG_LIGHT_CLASSES[type] || 'bg-edge-related-to/15'

export const getEdgeBgMediumClass = (type: RelationType) =>
  EDGE_BG_MEDIUM_CLASSES[type] || 'bg-edge-related-to/25'

export const getEdgeTextClass = (type: RelationType) =>
  EDGE_TEXT_CLASSES[type] || 'text-edge-related-to'

export const getEdgeBadgeClass = (type: RelationType) =>
  `${EDGE_BG_CLASSES[type] || 'bg-edge-related-to-muted'} ${EDGE_TEXT_CLASSES[type] || 'text-edge-related-to'}`
