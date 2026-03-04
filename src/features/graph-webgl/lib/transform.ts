/**
 * Data transformation utilities for WASM
 */

import type { Edge, Node } from '@/entities/map'
import { ComplexityEnum } from '@/entities/node'

// Valid complexity values from single source of truth
const VALID_COMPLEXITY = ComplexityEnum.options

/**
 * Sanitize node metadata for WASM compatibility
 * WASM/Rust uses strict enums that don't accept empty strings
 */
function sanitizeMetadata(metadata: Node['metadata']): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined
  }

  const result: Record<string, unknown> = {}

  // Only include valid complexity
  if (metadata.complexity && VALID_COMPLEXITY.includes(metadata.complexity)) {
    result.complexity = metadata.complexity
  }

  // Copy other fields if they exist
  if (metadata.sources && metadata.sources.length > 0) {
    result.sources = metadata.sources
  }
  if (metadata.tags && metadata.tags.length > 0) {
    result.tags = metadata.tags
  }

  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * WASM-compatible node format
 * Must match Rust Node struct with serde(rename_all = "camelCase")
 */
interface WasmNode {
  id: string
  mapId: string
  label: string
  description?: string
  type: string // NodeType enum in Rust
  position: { x: number; y: number }
  width: number
  height: number
  metadata?: Record<string, unknown>
}

/**
 * WASM-compatible edge format
 * Must match Rust Edge struct with serde(rename_all = "camelCase")
 */
interface WasmEdge {
  id: string
  mapId: string
  sourceNodeId: string
  targetNodeId: string
  relationType: string
  label?: string
  strength?: number
  bidirectional?: boolean
  metadata?: Record<string, unknown>
}

function sanitizeEdgeMetadata(metadata: Edge['metadata']): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined
  }

  const result: Record<string, unknown> = {}

  // Confidence drives dashing in WASM.
  if (typeof metadata.confidence === 'number') {
    result.confidence = metadata.confidence
  }

  // Keep createdBy for future styling/debug.
  if (metadata.createdBy) {
    result.createdBy = metadata.createdBy
  }

  if (metadata.evidence && metadata.evidence.length > 0) {
    result.evidence = metadata.evidence
  }

  if (metadata.examples && metadata.examples.length > 0) {
    result.examples = metadata.examples
  }

  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Transform frontend nodes/edges to WASM-compatible format
 */
export function transformToWasm(nodes: Node[], edges: Edge[]): string {
  const defaultWidth = 250
  const defaultHeight = 120

  const wasmNodes: WasmNode[] = nodes.map(node => {
    const wasmNode: WasmNode = {
      id: node.id,
      mapId: node.mapId,
      label: node.label,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      width: defaultWidth,
      height: defaultHeight
    }

    // Only add optional fields if they have values
    if (node.description) {
      wasmNode.description = node.description
    }

    const metadata = sanitizeMetadata(node.metadata)
    if (metadata) {
      wasmNode.metadata = metadata
    }

    return wasmNode
  })

  const wasmEdges: WasmEdge[] = edges.map(edge => {
    const wasmEdge: WasmEdge = {
      id: edge.id,
      mapId: edge.mapId,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      relationType: edge.relationType || 'related-to'
    }

    // Only add optional fields if they have values
    if (edge.label) {
      wasmEdge.label = edge.label
    }
    if (edge.strength !== undefined) {
      wasmEdge.strength = edge.strength
    }
    if (edge.bidirectional !== undefined) {
      wasmEdge.bidirectional = edge.bidirectional
    }

    const metadata = sanitizeEdgeMetadata(edge.metadata)
    if (metadata) {
      wasmEdge.metadata = metadata
    }

    return wasmEdge
  })

  const data = {
    nodes: wasmNodes,
    edges: wasmEdges
  }

  return JSON.stringify(data)
}

/**
 * Transform position data from WASM back to frontend format
 */
export function transformPositions(positionsJson: string): Map<string, { x: number; y: number }> {
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
export function applyPositions(nodes: Node[], positionsJson: string): Node[] {
  const positions = transformPositions(positionsJson)

  return nodes.map(node => {
    const pos = positions.get(node.id)
    if (pos) {
      return {
        ...node,
        position: { x: pos.x, y: pos.y }
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
    focusedNodeId: options.focusedNodeId
  })
}
