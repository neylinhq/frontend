/**
 * Data transformation utilities for WASM
 */

import type { Node, Edge, GraphData } from './types'

// Valid complexity values for WASM enum
const VALID_COMPLEXITY = ['basic', 'intermediate', 'advanced'] as const

/**
 * Sanitize node metadata for WASM compatibility
 * WASM/Rust uses strict enums that don't accept empty strings
 */
function sanitizeMetadata(metadata: Node['metadata']): Node['metadata'] {
  if (!metadata) return metadata

  return {
    ...metadata,
    // complexity must be a valid enum value or undefined
    complexity: metadata.complexity && VALID_COMPLEXITY.includes(metadata.complexity as any)
      ? metadata.complexity
      : undefined,
  }
}

/**
 * Transform frontend nodes/edges to WASM-compatible format
 */
export function transformToWasm(nodes: Node[], edges: Edge[]): string {
  const data: GraphData = {
    nodes: nodes.map(node => ({
      ...node,
      // Ensure all required fields are present
      position: node.position || { x: 0, y: 0 },
      width: node.width || 200,
      height: node.height || 100,
      // Sanitize metadata to avoid WASM enum parse errors
      metadata: sanitizeMetadata(node.metadata),
    })),
    edges: edges.map(edge => ({
      ...edge,
      // Ensure relation type is set
      relationType: edge.relationType || 'related-to',
    })),
  }

  return JSON.stringify(data)
}

/**
 * Transform position data from WASM back to frontend format
 */
export function transformPositions(
  positionsJson: string
): Map<string, { x: number; y: number }> {
  const positions = JSON.parse(positionsJson) as Array<{
    id: string
    x: number
    y: number
  }>

  const map = new Map<string, { x: number; y: number }>()
  for (const pos of positions) {
    map.set(pos.id, { x: pos.x, y: pos.y })
  }

  return map
}

/**
 * Apply positions from WASM to frontend nodes
 */
export function applyPositions(
  nodes: Node[],
  positionsJson: string
): Node[] {
  const positions = transformPositions(positionsJson)

  return nodes.map(node => {
    const pos = positions.get(node.id)
    if (pos) {
      return {
        ...node,
        position: { x: pos.x, y: pos.y },
      }
    }
    return node
  })
}

/**
 * Convert viewport to WASM format
 */
export function viewportToWasm(viewport: {
  x: number
  y: number
  zoom: number
  width: number
  height: number
}): string {
  return JSON.stringify(viewport)
}

/**
 * Convert layout options to WASM format
 */
export function layoutOptionsToWasm(options: {
  viewMode: 'overview' | 'focus' | 'path'
  spacingPercent: number
  directionStrength: number
  iterations?: number
  coolingFactor?: number
  theta?: number
  ignoreExistingPositions?: boolean
  focusedNodeId?: string
}): string {
  return JSON.stringify({
    viewMode: options.viewMode,
    spacingPercent: options.spacingPercent,
    directionStrength: options.directionStrength,
    iterations: options.iterations ?? 150,
    coolingFactor: options.coolingFactor ?? 0.97,
    theta: options.theta ?? 0.9,
    ignoreExistingPositions: options.ignoreExistingPositions ?? false,
    focusedNodeId: options.focusedNodeId,
  })
}
