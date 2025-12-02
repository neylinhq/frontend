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

// Tailwind classes for badge - using registered edge colors
export const EDGE_BADGE_CLASSES: Record<RelationType, string> = {
  prerequisite: 'bg-edge-prerequisite-muted text-edge-prerequisite border-transparent',
  causes: 'bg-edge-causes-muted text-edge-causes border-transparent',
  explains: 'bg-edge-explains-muted text-edge-explains border-transparent',
  'is-a': 'bg-edge-is-a-muted text-edge-is-a border-transparent',
  'has-a': 'bg-edge-has-a-muted text-edge-has-a border-transparent',
  'part-of': 'bg-edge-part-of-muted text-edge-part-of border-transparent',
  influences: 'bg-edge-influences-muted text-edge-influences border-transparent',
  'related-to': 'bg-edge-related-to-muted text-edge-related-to border-transparent',
  contradicts: 'bg-edge-contradicts-muted text-edge-contradicts border-transparent',
  'similar-to': 'bg-edge-similar-to-muted text-edge-similar-to border-transparent'
}

export const getEdgeStrokeColor = (type: RelationType) =>
  EDGE_STROKE_COLORS[type] || 'hsl(var(--edge-related-to))'

export const getEdgeBadgeClass = (type: RelationType) =>
  EDGE_BADGE_CLASSES[type] || 'bg-edge-related-to-muted text-edge-related-to border-transparent'
