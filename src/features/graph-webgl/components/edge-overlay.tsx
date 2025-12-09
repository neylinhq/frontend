/**
 * EdgeOverlay - SVG edge rendering
 *
 * Renders bezier curves for edges with arrows and optional labels.
 * Uses CSS variables for theme-aware colors.
 */

import { memo } from 'react'
import type { Edge } from '@/entities/map'

interface EdgeOverlayProps {
  edge: Edge
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  zoom: number
}

// Edge colors by relation type (using CSS color values that work in SVG)
const EDGE_COLORS: Record<string, string> = {
  'is-a': 'hsl(var(--chart-1))',
  'has-a': 'hsl(var(--chart-2))',
  'causes': 'hsl(var(--chart-3))',
  'explains': 'hsl(var(--chart-4))',
  'related-to': 'hsl(var(--muted-foreground))',
  'influences': 'hsl(var(--chart-5))',
  'part-of': 'hsl(var(--chart-1))',
  'prerequisite': 'hsl(var(--destructive))',
  'contradicts': 'hsl(var(--destructive))',
  'similar-to': 'hsl(var(--chart-2))',
}

/**
 * EdgeOverlay renders a single edge as SVG path
 */
export const EdgeOverlay = memo(function EdgeOverlay({
  edge,
  sourceX,
  sourceY,
  targetX,
  targetY,
  zoom,
}: EdgeOverlayProps) {
  // Calculate control points for bezier curve
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Curve amount based on distance
  const curveStrength = Math.min(distance * 0.3, 100)

  // Control points perpendicular to line
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  // Perpendicular offset for curve
  const nx = -dy / distance
  const ny = dx / distance
  const controlX = midX + nx * curveStrength * 0.3
  const controlY = midY + ny * curveStrength * 0.3

  // Path data for quadratic bezier
  const pathD = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`

  // Stroke width scales with zoom but has min/max
  const strokeWidth = Math.max(1, Math.min(3, 2 * zoom))

  // Get color for edge type
  const color = EDGE_COLORS[edge.relationType] || EDGE_COLORS['related-to']

  // Arrow marker ID (unique per edge to support different colors)
  const markerId = `arrow-${edge.id}`

  // Calculate arrow position (slightly before target)
  const arrowOffset = 20 * zoom
  const arrowX = targetX - (dx / distance) * arrowOffset
  const arrowY = targetY - (dy / distance) * arrowOffset

  return (
    <g className="edge-overlay">
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={color}
          />
        </marker>
      </defs>

      {/* Edge path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.6}
        markerEnd={edge.bidirectional ? undefined : `url(#${markerId})`}
        markerStart={edge.bidirectional ? `url(#${markerId})` : undefined}
      />

      {/* Label at midpoint (only at higher zoom) */}
      {zoom >= 0.5 && edge.label && (
        <text
          x={controlX}
          y={controlY - 8}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{
            fontSize: Math.max(10, 12 * zoom),
            pointerEvents: 'none',
          }}
        >
          {edge.label}
        </text>
      )}
    </g>
  )
}, (prev, next) => {
  // Custom memo comparator for performance
  return (
    prev.edge.id === next.edge.id &&
    prev.edge.relationType === next.edge.relationType &&
    prev.edge.label === next.edge.label &&
    Math.abs(prev.sourceX - next.sourceX) < 1 &&
    Math.abs(prev.sourceY - next.sourceY) < 1 &&
    Math.abs(prev.targetX - next.targetX) < 1 &&
    Math.abs(prev.targetY - next.targetY) < 1 &&
    Math.abs(prev.zoom - next.zoom) < 0.01
  )
})
