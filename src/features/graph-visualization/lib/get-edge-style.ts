import type { RelationType } from '@/entities/edge'

// Colors for edge lines based on relation type
const EDGE_COLORS: Record<RelationType, string> = {
  'prerequisite': '#f97316', // orange-500 - important dependency
  'causes': '#ef4444',       // red-500
  'explains': '#8b5cf6',     // violet-500
  'is-a': '#6366f1',         // indigo-500
  'has-a': '#22c55e',        // green-500
  'part-of': '#14b8a6',      // teal-500
  'influences': '#f59e0b',   // amber-500
  'related-to': '#94a3b8',   // slate-400
  'contradicts': '#dc2626',  // red-600
  'similar-to': '#84cc16',   // lime-500
}

export function getEdgeStrokeByType(relationType: RelationType): string {
  return EDGE_COLORS[relationType] || '#94a3b8'
}

export function getEdgeStroke(confidence: number): string {
  // High confidence - blue, low - gray
  return confidence > 0.7 ? '#3b82f6' : '#94a3b8' // blue-500 : slate-400
}

export function getEdgeWidth(strength: number): number {
  // Connection strength affects line width
  return strength * 2 + 1
}

export function getEdgeDashArray(confidence: number): string | undefined {
  // Dashed line for low confidence
  return confidence < 0.5 ? '5,5' : undefined
}

export function getEdgeOpacity(isSelected: boolean): number {
  return isSelected ? 1 : 0.7
}
