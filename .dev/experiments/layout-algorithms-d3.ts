/**
 * D3-Force based layout algorithms with Barnes-Hut optimization
 * O(n log n) complexity instead of O(n²)
 *
 * This is a drop-in replacement for layout-algorithms.ts
 * Same interface, different implementation
 */

import type { Edge, Node } from '@xyflow/react'
import {
  type Force,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum
} from 'd3-force'
import type { RelationType } from '@/entities/edge'
import type { ViewMode } from '@/features/graph/graph-core'

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

// Enable experimental edge crossing minimization force
// This adds O(m²) complexity but can reduce edge crossings at low direction values
const ENABLE_EDGE_CROSSING_MINIMIZATION = false

// Edge weights for clustering - prerequisite is strongest
const EDGE_WEIGHTS: Record<RelationType, number> = {
  prerequisite: 1.0,
  'is-a': 0.8,
  'part-of': 0.8,
  explains: 0.6,
  causes: 0.6,
  influences: 0.5,
  'has-a': 0.5,
  'similar-to': 0.4,
  'related-to': 0.3,
  contradicts: 0.2
}

// D3 simulation node type
interface D3Node extends SimulationNodeDatum {
  id: string
  originalNode: Node
}

// D3 simulation link type
interface D3Link extends SimulationLinkDatum<D3Node> {
  weight: number
}

// Node metrics for layout optimization
interface NodeMetrics {
  degree: number // Total connections
  inDegree: number // Incoming edges
  outDegree: number // Outgoing edges
  isLeaf: boolean // degree <= 2
  isHub: boolean // degree >= 4
  horizontalBias: number // -1 to 1, determines left/right positioning
}

/**
 * Apply layout based on view mode (D3-Force implementation)
 */
export const applyLayout = (nodes: Node[], edges: Edge[], options: LayoutOptions) => {
  const { viewMode, spacingPercent = 100, directionStrength = 100 } = options

  if (nodes.length === 0) return { nodes, edges }

  switch (viewMode) {
    case 'focus':
      // Focus mode uses the same force-directed layout as overview
      return forceDirectedLayout(nodes, edges, { spacingPercent, directionStrength })

    case 'path':
      return pathLayout(nodes, edges, { spacingPercent, directionStrength })

    default:
      return forceDirectedLayout(nodes, edges, { spacingPercent, directionStrength })
  }
}

interface InternalOptions {
  spacingPercent: number
  directionStrength: number
}

const computeNodeMetrics = (nodes: D3Node[], links: D3Link[]) => {
  const metrics = new Map<string, NodeMetrics>()

  // Initialize all nodes
  for (const node of nodes) {
    metrics.set(node.id, {
      degree: 0,
      inDegree: 0,
      outDegree: 0,
      isLeaf: true,
      isHub: false,
      horizontalBias: 0
    })
  }

  // Count degrees from links
  for (const link of links) {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as D3Node).id
    const targetId = typeof link.target === 'string' ? link.target : (link.target as D3Node).id

    const sourceMetrics = metrics.get(sourceId)
    const targetMetrics = metrics.get(targetId)

    if (sourceMetrics) {
      sourceMetrics.degree++
      sourceMetrics.outDegree++
    }
    if (targetMetrics) {
      targetMetrics.degree++
      targetMetrics.inDegree++
    }
  }

  // Compute leaf/hub status and horizontal bias
  for (const [id, m] of metrics) {
    m.isLeaf = m.degree <= 2
    m.isHub = m.degree >= 4
    // Deterministic horizontal bias based on node id hash
    m.horizontalBias = hashToSide(id)
  }

  return metrics
}

const hashToSide = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash % 2 === 0 ? -1 : 1
}

const forceEdgeDirection = (
  links: D3Link[],
  options: { strength: number; idealDistance: number }
) => {
  const { idealDistance } = options
  let strength = options.strength

  const force = (alpha: number) => {
    if (strength <= 0) return

    for (const link of links) {
      const source = link.source as D3Node
      const target = link.target as D3Node

      if (!source || !target || source.x === undefined || target.x === undefined) continue

      // Vertical force proportional to edge weight and direction strength
      // Balanced for D3's velocity model: 0.4 (between 0.15 too weak and 1.2 too strong)
      const verticalForce = idealDistance * 0.4 * strength * link.weight * alpha

      // Push source UP (decrease y), target DOWN (increase y)
      source.vy = (source.vy ?? 0) - verticalForce
      target.vy = (target.vy ?? 0) + verticalForce

      // Horizontal spread when nodes are too close vertically
      const yDiff = Math.abs((target.y ?? 0) - (source.y ?? 0))
      if (yDiff < idealDistance * 0.5) {
        // Spread force to prevent horizontal collapse
        const spreadForce = idealDistance * 0.15 * strength * alpha
        const sourceX = source.x ?? 0
        const targetX = target.x ?? 0

        if (sourceX <= targetX) {
          source.vx = (source.vx ?? 0) - spreadForce
          target.vx = (target.vx ?? 0) + spreadForce
        } else {
          source.vx = (source.vx ?? 0) + spreadForce
          target.vx = (target.vx ?? 0) - spreadForce
        }
      }
    }
  }
  // D3 force interface - strength getter/setter
  ;(force as any).strength = (s?: number) => {
    if (s === undefined) return strength
    strength = s
    return force
  }

  return force as Force<D3Node, D3Link>
}

const segmentsIntersect = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
) => {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denom) < 1e-10) return false

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  return t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99
}

const forceEdgeCrossing = (links: D3Link[], options: { strength: number }) => {
  let strength = options.strength

  const force = (alpha: number) => {
    if (strength <= 0 || links.length < 2) return

    // Check all pairs of edges for crossings
    for (let i = 0; i < links.length; i++) {
      for (let j = i + 1; j < links.length; j++) {
        const link1 = links[i]
        const link2 = links[j]

        const s1 = link1.source as D3Node
        const t1 = link1.target as D3Node
        const s2 = link2.source as D3Node
        const t2 = link2.target as D3Node

        if (!s1 || !t1 || !s2 || !t2) continue

        // Skip if edges share a node
        if (s1.id === s2.id || s1.id === t2.id || t1.id === s2.id || t1.id === t2.id) continue

        const x1 = s1.x ?? 0,
          y1 = s1.y ?? 0
        const x2 = t1.x ?? 0,
          y2 = t1.y ?? 0
        const x3 = s2.x ?? 0,
          y3 = s2.y ?? 0
        const x4 = t2.x ?? 0,
          y4 = t2.y ?? 0

        if (segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) {
          // Calculate perpendicular direction to edge 1
          const dx1 = x2 - x1
          const dy1 = y2 - y1
          const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1
          const nx = -dy1 / len1
          const ny = dx1 / len1

          // Determine which side edge 2 midpoint is on
          const mid2x = (x3 + x4) / 2
          const mid2y = (y3 + y4) / 2
          const dot = (mid2x - x1) * nx + (mid2y - y1) * ny
          const dir = dot >= 0 ? 1 : -1

          // Apply forces to uncross
          const pushForce = strength * 30 * alpha

          s2.vx = (s2.vx ?? 0) + nx * pushForce * dir
          s2.vy = (s2.vy ?? 0) + ny * pushForce * dir
          t2.vx = (t2.vx ?? 0) + nx * pushForce * dir
          t2.vy = (t2.vy ?? 0) + ny * pushForce * dir

          // Counter-force on edge 1
          s1.vx = (s1.vx ?? 0) - nx * pushForce * dir * 0.5
          s1.vy = (s1.vy ?? 0) - ny * pushForce * dir * 0.5
          t1.vx = (t1.vx ?? 0) - nx * pushForce * dir * 0.5
          t1.vy = (t1.vy ?? 0) - ny * pushForce * dir * 0.5
        }
      }
    }
  }

  ;(force as any).strength = (s?: number) => {
    if (s === undefined) return strength
    strength = s
    return force
  }

  return force as Force<D3Node, D3Link>
}

const forceDirectedLayout = (nodes: Node[], edges: Edge[], options: InternalOptions) => {
  const { spacingPercent, directionStrength } = options

  // Match original algorithm: nodeSpacing = 200 * factor, idealDistance = nodeSpacing * 1.5 = 300 * factor
  const nodeSpacing = 200 * (spacingPercent / 100)
  const idealDistance = nodeSpacing * 1.5 // 300 at 100%
  // Normalized: 0-2 range (0=no hierarchy, 2=max hierarchy)
  const normalizedDirection = directionStrength / 100

  // Convert to D3 format
  // Match original: initial radius ~200, random offset ~50
  const d3Nodes: D3Node[] = nodes.map((node, i) => {
    const hasValidPosition = node.position && (node.position.x !== 0 || node.position.y !== 0)
    return {
      id: node.id,
      x: hasValidPosition ? node.position.x : Math.cos(i * 2.4) * 200 + Math.random() * 50,
      y: hasValidPosition ? node.position.y : Math.sin(i * 2.4) * 200 + Math.random() * 50,
      originalNode: node
    }
  })

  const nodeMap = new Map(d3Nodes.map(n => [n.id, n]))

  // Convert edges to D3 format with weights
  const d3Links: D3Link[] = edges
    .filter(e => nodeMap.has(e.source) && nodeMap.has(e.target))
    .map(edge => {
      const relationType = (edge.data?.relationType as RelationType) || 'related-to'
      return {
        source: edge.source,
        target: edge.target,
        weight: EDGE_WEIGHTS[relationType] || 0.3
      }
    })

  // Charge strength for node repulsion
  // Original uses force = idealDistance² / dist
  // D3 forceManyBody uses force = strength / dist² by default
  // To approximate: strength ≈ -idealDistance² gives similar magnitude
  const chargeStrength = -(idealDistance * idealDistance) / 100 // Scaled down for D3's quadratic model

  // Create simulation with 150 iterations to match original
  const simulation: Simulation<D3Node, D3Link> = forceSimulation(d3Nodes)
    // Repulsion between nodes - Barnes-Hut with theta=0.9 for O(n log n)
    .force(
      'charge',
      forceManyBody<D3Node>()
        .strength(chargeStrength)
        .theta(0.9)
        .distanceMax(idealDistance * 8)
    )
    // Attraction along edges (weighted)
    // Original: force = dist² / idealDistance * weight
    // D3 forceLink has different model, tune strength to approximate
    .force(
      'link',
      forceLink<D3Node, D3Link>(d3Links)
        .id(d => d.id)
        .distance(idealDistance)
        .strength(d => d.weight * 0.3)
    )
    // Center gravity to prevent drift - match original 0.01
    .force('center', forceCenter(0, 0).strength(0.01))
    // Collision detection to prevent overlap
    .force(
      'collide',
      forceCollide<D3Node>()
        .radius(nodeSpacing * 0.8)
        .strength(0.8)
    )

  // Edge-based vertical forces (replaces depth-based forceY)
  // Source pushed UP, target pushed DOWN - creates natural hierarchy
  if (normalizedDirection > 0) {
    simulation.force(
      'edgeDirection',
      forceEdgeDirection(d3Links, {
        strength: normalizedDirection,
        idealDistance: idealDistance
      })
    )

    // Horizontal spread to prevent vertical collapse
    // Uses deterministic hash-based left/right bias
    // Strength increases with direction to maintain balance
    const nodeMetrics = computeNodeMetrics(d3Nodes, d3Links)
    simulation.force(
      'horizontalSpread',
      forceX<D3Node>()
        .x(node => {
          const metrics = nodeMetrics.get(node.id)
          // Push left (-1) or right (+1) based on node hash
          return (metrics?.horizontalBias ?? 0) * idealDistance * normalizedDirection
        })
        .strength(0.05 * normalizedDirection)
    )
  }

  // Horizontal spread is handled by:
  // 1. charge repulsion between all nodes
  // 2. edge-based spread in forceEdgeDirection when nodes are close vertically
  // 3. forceX with hash-based bias (when direction > 0) to prevent vertical collapse

  // Optional: Edge crossing minimization (O(m²) - can be slow for large graphs)
  // Stronger at low direction values where we prioritize avoiding crossings
  if (ENABLE_EDGE_CROSSING_MINIMIZATION && d3Links.length >= 2) {
    const crossingStrength = Math.max(0, 1 - normalizedDirection / 2)
    if (crossingStrength > 0.1) {
      simulation.force(
        'edgeCrossing',
        forceEdgeCrossing(d3Links, {
          strength: crossingStrength
        })
      )
    }
  }

  // Run simulation synchronously
  simulation.stop()

  // Match original iteration count of 150
  const iterations = 150

  for (let i = 0; i < iterations; i++) {
    simulation.tick()
  }

  // Convert back to ReactFlow format
  const positionedNodes = d3Nodes.map(d3Node => ({
    ...d3Node.originalNode,
    position: {
      x: d3Node.x ?? 0,
      y: d3Node.y ?? 0
    }
  }))

  return { nodes: positionedNodes, edges }
}

const pathLayout = (nodes: Node[], edges: Edge[], options: InternalOptions) => {
  const { spacingPercent } = options
  const nodeSpacing = 200 * (spacingPercent / 100)
  const levelSpacing = 300 * (spacingPercent / 100)

  // Filter to only prerequisite edges
  const prereqEdges = edges.filter(e => (e.data?.relationType as RelationType) === 'prerequisite')

  // Build directed graph
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
  levels.forEach(l => {
    if (l > maxLevel) maxLevel = l
  })
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

  // Position nodes
  const positionedNodes = nodes.map(node => {
    const level = levels.get(node.id) || 0
    const levelNodes = levelGroups.get(level) || []
    const indexInLevel = levelNodes.indexOf(node.id)
    const levelHeight = levelNodes.length * nodeSpacing

    return {
      ...node,
      position: {
        x: level * levelSpacing,
        y: indexInLevel * nodeSpacing - levelHeight / 2 + nodeSpacing / 2
      }
    }
  })

  return { nodes: positionedNodes, edges }
}

/**
 * Get connected nodes within N levels from start node
 */
export const getNodesWithinDepth = (startNodeId: string, edges: Edge[], depth: number) => {
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
 */
export const getEdgesBetweenNodes = (edges: Edge[], nodeIds: Set<string>) => {
  return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
}
