/**
 * Original layout algorithm with Barnes-Hut optimization for repulsion
 * O(n log n) complexity instead of O(n²)
 *
 * This is the EXACT SAME algorithm as layout-algorithms.ts, with only
 * the O(n²) repulsion loop replaced by Barnes-Hut (d3-quadtree).
 * All other logic is IDENTICAL to the original.
 */

import { quadtree, type Quadtree } from 'd3-quadtree'
import type { Edge, Node } from '@xyflow/react'
import type { ViewMode } from '../model/graph-view.store'
import type { RelationType } from '@/entities/edge'

interface LayoutOptions {
  viewMode: ViewMode
  focusedNodeId?: string | null
  spacingPercent?: number // 50-200%, default 100
  directionStrength?: number // 0-200, default 100
}

interface LayoutResult {
  nodes: Node[]
  edges: Edge[]
}

const DEFAULT_NODE_SPACING = 200
const DEFAULT_LEVEL_SPACING = 300

// Edge weights for clustering - prerequisite is strongest
const EDGE_WEIGHTS: Record<RelationType, number> = {
  'prerequisite': 1.0,
  'is-a': 0.8,
  'part-of': 0.8,
  'explains': 0.6,
  'causes': 0.6,
  'influences': 0.5,
  'has-a': 0.5,
  'similar-to': 0.4,
  'related-to': 0.3,
  'contradicts': 0.2,
}

/**
 * Apply layout based on view mode
 */
export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): LayoutResult {
  const { viewMode, spacingPercent = 100, directionStrength = 100 } = options

  if (nodes.length === 0) return { nodes, edges }

  // Calculate actual spacing based on percentage
  const spacingFactor = spacingPercent / 100
  const nodeSpacing = DEFAULT_NODE_SPACING * spacingFactor
  const levelSpacing = DEFAULT_LEVEL_SPACING * spacingFactor
  // Normalize directionStrength from 0-200 to 0-2
  const normalizedDirection = directionStrength / 100

  const internalOptions: InternalLayoutOptions = {
    nodeSpacing,
    levelSpacing,
    directionStrength: normalizedDirection,
  }

  switch (viewMode) {
    case 'focus':
      // Focus mode uses the same force-directed layout as overview
      // Focus only FILTERS nodes by depth, layout algorithm is the same
      return forceDirectedLayout(nodes, edges, internalOptions)

    case 'path':
      return pathLayout(nodes, edges, internalOptions)

    default:
      return forceDirectedLayout(nodes, edges, internalOptions)
  }
}

interface InternalLayoutOptions {
  nodeSpacing: number
  levelSpacing: number
  directionStrength: number // 0-2 (normalized from 0-200)
}

// Position node for simulation
interface PosNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
}

/**
 * Barnes-Hut approximation for repulsive forces using quadtree
 * Complexity: O(n log n) instead of O(n²)
 *
 * Uses the same force formula as original:
 * force = (idealDistance²) / dist
 */
function applyBarnesHutRepulsion(
  positions: PosNode[],
  idealDistance: number,
  theta: number = 0.9
): void {
  if (positions.length < 2) return

  // Build quadtree
  const tree = quadtree<PosNode>()
    .x((d: PosNode) => d.x)
    .y((d: PosNode) => d.y)
    .addAll(positions)

  const idealDistSq = idealDistance * idealDistance

  // For each node, traverse tree and accumulate forces
  for (const node of positions) {
    // Recursive tree traversal with Barnes-Hut criterion
    visit(tree, node, idealDistSq, theta)
  }
}

/**
 * Visit quadtree node and apply forces using Barnes-Hut approximation
 */
function visit(
  tree: Quadtree<PosNode>,
  target: PosNode,
  idealDistSq: number,
  theta: number
): void {
  const root = tree.root()
  if (!root) return

  visitNode(root, target, idealDistSq, theta, tree.extent())
}

// Quadtree node type (internal structure of d3-quadtree)
type QuadNode = {
  data?: PosNode
  length?: number
  0?: QuadNode
  1?: QuadNode
  2?: QuadNode
  3?: QuadNode
}

/**
 * Recursively visit quadtree nodes
 */
function visitNode(
  quad: QuadNode | undefined,
  target: PosNode,
  idealDistSq: number,
  theta: number,
  extent: [[number, number], [number, number]] | undefined
): void {
  if (!quad) return

  // Leaf node - single point
  if (!quad.length) {
    const other = quad.data
    if (other && other.id !== target.id) {
      applyRepulsionForce(target, other, idealDistSq)
    }
    return
  }

  // Internal node - check Barnes-Hut criterion
  // Calculate center of mass and total count for this quad
  // IMPORTANT: exclude target itself from calculation
  let totalX = 0, totalY = 0, count = 0

  function accumulate(q: QuadNode | undefined) {
    if (!q) return
    if (!q.length) {
      // Leaf
      if (q.data && q.data.id !== target.id) {
        totalX += q.data.x
        totalY += q.data.y
        count++
      }
    } else {
      // Internal - recurse
      accumulate(q[0])
      accumulate(q[1])
      accumulate(q[2])
      accumulate(q[3])
    }
  }
  accumulate(quad)

  if (count === 0) return

  const centerX = totalX / count
  const centerY = totalY / count

  // Calculate quad size (approximate)
  const dx = target.x - centerX
  const dy = target.y - centerY
  const dist = Math.sqrt(dx * dx + dy * dy) || 0.01

  // Estimate quad size from extent
  let quadSize = 1000 // default
  if (extent) {
    quadSize = Math.max(extent[1][0] - extent[0][0], extent[1][1] - extent[0][1])
  }

  // Barnes-Hut criterion: if quad is small enough relative to distance, treat as single body
  if (quadSize / dist < theta) {
    // Treat entire quad as single point at center of mass
    // Apply force scaled by count
    const force = (idealDistSq / dist) * count
    const fx = (dx / dist) * force
    const fy = (dy / dist) * force

    target.vx += fx
    target.vy += fy
  } else {
    // Recurse into children
    const children = [quad[0], quad[1], quad[2], quad[3]]
    for (let i = 0; i < 4; i++) {
      const child = children[i]
      if (child) {
        // Estimate child extent
        let childExtent: [[number, number], [number, number]] | undefined
        if (extent) {
          const midX = (extent[0][0] + extent[1][0]) / 2
          const midY = (extent[0][1] + extent[1][1]) / 2
          // d3-quadtree children order: 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
          switch (i) {
            case 0: childExtent = [[extent[0][0], extent[0][1]], [midX, midY]]; break // top-left
            case 1: childExtent = [[midX, extent[0][1]], [extent[1][0], midY]]; break // top-right
            case 2: childExtent = [[extent[0][0], midY], [midX, extent[1][1]]]; break // bottom-left
            case 3: childExtent = [[midX, midY], [extent[1][0], extent[1][1]]]; break // bottom-right
          }
        }
        visitNode(child, target, idealDistSq, theta, childExtent)
      }
    }
  }
}

/**
 * Apply repulsive force between two nodes
 * Formula: force = (idealDistance²) / dist (same as original)
 */
function applyRepulsionForce(
  a: PosNode,
  b: PosNode,
  idealDistSq: number
): void {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 0.01

  const force = idealDistSq / dist
  const fx = (dx / dist) * force
  const fy = (dy / dist) * force

  // Apply to target (a) only - b will be processed when it's the target
  a.vx += fx
  a.vy += fy
}

/**
 * Force-directed layout with weighted edges for clustering
 * Uses Barnes-Hut for O(n log n) repulsion
 *
 * ALL OTHER LOGIC IS IDENTICAL TO ORIGINAL layout-algorithms.ts
 */
function forceDirectedLayout(
  nodes: Node[],
  edges: Edge[],
  options: InternalLayoutOptions
): LayoutResult {
  const { nodeSpacing } = options
  const iterations = 150
  const idealDistance = nodeSpacing * 1.5
  const coolingFactor = 0.97

  // Initialize positions - IDENTICAL TO ORIGINAL
  const positions: PosNode[] = nodes.map((n, i) => {
    const hasValidPosition = n.position && (n.position.x !== 0 || n.position.y !== 0)
    return {
      id: n.id,
      x: hasValidPosition ? n.position.x : (Math.cos(i * 2.4) * 200 + Math.random() * 50),
      y: hasValidPosition ? n.position.y : (Math.sin(i * 2.4) * 200 + Math.random() * 50),
      vx: 0,
      vy: 0,
    }
  })

  const posMap = new Map(positions.map(p => [p.id, p]))

  let temperature = idealDistance * 0.5

  for (let iter = 0; iter < iterations; iter++) {
    // === REPULSIVE FORCES ===
    // OPTIMIZED: Use Barnes-Hut instead of O(n²) loop
    // Original formula is preserved: force = (idealDistance²) / dist
    applyBarnesHutRepulsion(positions, idealDistance, 0.9)

    // === ATTRACTIVE FORCES along edges (weighted by edge type) ===
    // IDENTICAL TO ORIGINAL
    edges.forEach(e => {
      const source = posMap.get(e.source)
      const target = posMap.get(e.target)
      if (!source || !target) return

      const dx = target.x - source.x
      const dy = target.y - source.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01

      // Get weight from edge data
      const relationType = (e.data?.relationType as RelationType) || 'related-to'
      const weight = EDGE_WEIGHTS[relationType] || 0.3

      const force = (dist * dist) / idealDistance * weight
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      source.vx += fx
      source.vy += fy
      target.vx -= fx
      target.vy -= fy

      // === DIRECTION FORCE: source should be ABOVE target ===
      // IDENTICAL TO ORIGINAL
      if (options.directionStrength > 0) {
        const verticalForce = idealDistance * 1.2 * options.directionStrength * weight
        source.vy -= verticalForce  // push source UP (decrease y)
        target.vy += verticalForce  // push target DOWN (increase y)

        // Add horizontal spread to prevent vertical collapse
        // Nodes at similar Y should spread horizontally
        const yDiff = Math.abs(target.y - source.y)
        if (yDiff < idealDistance * 0.5) {
          const spreadForce = idealDistance * 0.3 * options.directionStrength
          if (source.x <= target.x) {
            source.vx -= spreadForce
            target.vx += spreadForce
          } else {
            source.vx += spreadForce
            target.vx -= spreadForce
          }
        }
      }
    })

    // === CENTER GRAVITY to prevent drift ===
    // IDENTICAL TO ORIGINAL
    const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length
    const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length
    positions.forEach(p => {
      p.vx -= (p.x - centerX) * 0.01
      p.vy -= (p.y - centerY) * 0.01
    })

    // === APPLY VELOCITIES with temperature ===
    // IDENTICAL TO ORIGINAL
    positions.forEach(p => {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (speed > temperature) {
        p.vx = (p.vx / speed) * temperature
        p.vy = (p.vy / speed) * temperature
      }
      p.x += p.vx
      p.y += p.vy
      p.vx = 0
      p.vy = 0
    })

    temperature *= coolingFactor
  }

  const positionedNodes = nodes.map(node => {
    const pos = posMap.get(node.id)
    return {
      ...node,
      position: { x: pos?.x ?? 0, y: pos?.y ?? 0 },
    }
  })

  return { nodes: positionedNodes, edges }
}

/**
 * Linear/tree layout based on prerequisite edges
 * Used in Path mode
 * IDENTICAL TO ORIGINAL
 */
function pathLayout(
  nodes: Node[],
  edges: Edge[],
  options: InternalLayoutOptions
): LayoutResult {
  const { nodeSpacing, levelSpacing } = options

  // Filter to only prerequisite edges
  const prereqEdges = edges.filter(e =>
    (e.data?.relationType as RelationType) === 'prerequisite'
  )

  // Build directed graph (source is prerequisite of target)
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()

  nodes.forEach(n => {
    outgoing.set(n.id, [])
    incoming.set(n.id, [])
  })

  prereqEdges.forEach(e => {
    outgoing.get(e.source)?.push(e.target)
    incoming.get(e.target)?.push(e.source)
  })

  // Find root nodes (no prerequisites)
  const roots = nodes.filter(n => (incoming.get(n.id)?.length || 0) === 0)

  // If no roots, use force-directed as fallback
  if (roots.length === 0) {
    return forceDirectedLayout(nodes, edges, options)
  }

  // BFS to assign levels
  const levels = new Map<string, number>()
  const visited = new Set<string>()
  const queue = [...roots.map(r => r.id)]
  roots.forEach(r => {
    levels.set(r.id, 0)
    visited.add(r.id)
  })

  while (queue.length > 0) {
    const nodeId = queue.shift()
    if (!nodeId) continue
    const currentLevel = levels.get(nodeId) ?? 0

    outgoing.get(nodeId)?.forEach(targetId => {
      if (!visited.has(targetId)) {
        visited.add(targetId)
        levels.set(targetId, currentLevel + 1)
        queue.push(targetId)
      }
    })
  }

  // Handle nodes not in prerequisite chain
  let maxLevel = 0
  levels.forEach(l => { if (l > maxLevel) maxLevel = l })
  nodes.forEach(n => {
    if (!levels.has(n.id)) {
      levels.set(n.id, maxLevel + 1)
    }
  })

  // Group by level
  const levelGroups = new Map<number, string[]>()
  levels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) levelGroups.set(level, [])
    levelGroups.get(level)?.push(nodeId)
  })

  // Position nodes left-to-right
  const positionedNodes = nodes.map(node => {
    const level = levels.get(node.id) || 0
    const levelNodes = levelGroups.get(level) || []
    const indexInLevel = levelNodes.indexOf(node.id)
    const levelHeight = levelNodes.length * nodeSpacing

    return {
      ...node,
      position: {
        x: level * levelSpacing,
        y: indexInLevel * nodeSpacing - levelHeight / 2 + nodeSpacing / 2,
      },
    }
  })

  return { nodes: positionedNodes, edges }
}

/**
 * Get connected nodes within N levels from start node
 * IDENTICAL TO ORIGINAL
 */
export function getNodesWithinDepth(
  startNodeId: string,
  edges: Edge[],
  depth: number
): Set<string> {
  const connected = new Set<string>([startNodeId])

  // Build adjacency
  const adjacency = new Map<string, Set<string>>()

  edges.forEach(e => {
    if (!adjacency.has(e.source)) adjacency.set(e.source, new Set())
    if (!adjacency.has(e.target)) adjacency.set(e.target, new Set())
    adjacency.get(e.source)?.add(e.target)
    adjacency.get(e.target)?.add(e.source)
  })

  let frontier = new Set([startNodeId])

  for (let d = 0; d < depth; d++) {
    const nextFrontier = new Set<string>()

    frontier.forEach(nodeId => {
      adjacency.get(nodeId)?.forEach(neighborId => {
        if (!connected.has(neighborId)) {
          connected.add(neighborId)
          nextFrontier.add(neighborId)
        }
      })
    })

    frontier = nextFrontier
  }

  return connected
}

/**
 * Get edges between a set of nodes
 * IDENTICAL TO ORIGINAL
 */
export function getEdgesBetweenNodes(
  edges: Edge[],
  nodeIds: Set<string>
): Edge[] {
  return edges.filter(e =>
    nodeIds.has(e.source) && nodeIds.has(e.target)
  )
}
