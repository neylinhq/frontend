/**
 * Type definitions for Graph WebGL
 * These types mirror the Rust WASM types
 */

import type { Edge, Node } from '@/entities/map'
import type { ViewportState } from '@/shared/lib/viewport'

// Re-export entity types
export type { Node, Edge }

// Re-export from shared
export type { ViewportState }

/**
 * Graph engine state from WASM
 */
export interface GraphEngineState {
  isReady: boolean
  isLoading: boolean
  error: string | null
  nodeCount: number
  edgeCount: number
}

/**
 * Layout options matching Rust LayoutOptions
 */
export interface LayoutOptions {
  viewMode: 'overview' | 'focus' | 'path'
  spacingPercent: number // 50-200
  directionStrength: number // 0-200
  iterations: number // 150 default
  coolingFactor: number // 0.97 default
  theta: number // 0.9 Barnes-Hut threshold
  ignoreExistingPositions: boolean
  focusedNodeId?: string
}

/**
 * Layout result from WASM
 */
export interface LayoutResult {
  converged: boolean
  iterationsRun: number
  elapsedMs: number
}

/**
 * Node position data
 */
export interface NodePosition {
  id: string
  x: number
  y: number
}

/**
 * Visible node data for DOM overlay
 */
export interface VisibleNode {
  id: string
  x: number // Screen X
  y: number // Screen Y
  width: number // Scaled width
  height: number // Scaled height
  node: Node // Original node data
}

/**
 * Interaction state
 */
export interface InteractionState {
  selectedNodeId: string | null
  focusedNodeId: string | null
  hoveredNodeId: string | null
  isDragging: boolean
  isPanning: boolean
  dragStartX: number
  dragStartY: number
}

/**
 * Graph data for WASM load
 */
export interface GraphData {
  nodes: Node[]
  edges: Edge[]
}
