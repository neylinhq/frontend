import type { Node, Edge } from '@xyflow/react'
import type { ViewMode } from '../model/graph-view.store'
import type { RelationType } from '@/entities/edge'

interface LayoutOptions {
  viewMode: ViewMode
  focusedNodeId?: string | null
  nodeSpacing?: number
  levelSpacing?: number
}

interface LayoutResult {
  nodes: Node[]
  edges: Edge[]
}

const DEFAULT_NODE_SPACING = 100
const DEFAULT_LEVEL_SPACING = 150

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
  const { viewMode, focusedNodeId } = options

  if (nodes.length === 0) return { nodes, edges }

  switch (viewMode) {
    case 'focus':
      if (focusedNodeId) {
        return focusedLayout(nodes, edges, focusedNodeId, options)
      }
      return forceDirectedLayout(nodes, edges, options)

    case 'path':
      return pathLayout(nodes, edges, options)

    case 'overview':
    default:
      return forceDirectedLayout(nodes, edges, options)
  }
}

/**
 * Force-directed layout with weighted edges for clustering
 * Used in Overview mode
 */
function forceDirectedLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): LayoutResult {
  const nodeSpacing = options.nodeSpacing || DEFAULT_NODE_SPACING
  const iterations = 100
  const idealDistance = nodeSpacing * 1.5
  const coolingFactor = 0.95

  // Initialize positions
  const positions = nodes.map((n, i) => ({
    id: n.id,
    x: n.position?.x ?? (Math.cos(i * 2.4) * 200 + Math.random() * 50),
    y: n.position?.y ?? (Math.sin(i * 2.4) * 200 + Math.random() * 50),
    vx: 0,
    vy: 0,
  }))

  const posMap = new Map(positions.map(p => [p.id, p]))

  let temperature = idealDistance * 0.5

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsive forces between all pairs
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i]
        const b = positions[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01

        const force = (idealDistance * idealDistance) / dist
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        a.vx -= fx
        a.vy -= fy
        b.vx += fx
        b.vy += fy
      }
    }

    // Attractive forces along edges (weighted by edge type)
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
    })

    // Center gravity to prevent drift
    const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length
    const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length
    positions.forEach(p => {
      p.vx -= (p.x - centerX) * 0.01
      p.vy -= (p.y - centerY) * 0.01
    })

    // Apply velocities with temperature
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
    const pos = posMap.get(node.id)!
    return {
      ...node,
      position: { x: pos.x, y: pos.y },
    }
  })

  return { nodes: positionedNodes, edges }
}

/**
 * Radial layout centered on focused node
 * Used in Focus mode
 */
function focusedLayout(
  nodes: Node[],
  edges: Edge[],
  focusedNodeId: string,
  options: LayoutOptions
): LayoutResult {
  const levelSpacing = options.levelSpacing || DEFAULT_LEVEL_SPACING

  // Build adjacency
  const adjacency = new Map<string, Set<string>>()
  nodes.forEach(n => adjacency.set(n.id, new Set()))

  edges.forEach(e => {
    adjacency.get(e.source)?.add(e.target)
    adjacency.get(e.target)?.add(e.source)
  })

  // BFS to assign levels from focused node
  const levels = new Map<string, number>()
  const queue = [focusedNodeId]
  levels.set(focusedNodeId, 0)

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const currentLevel = levels.get(nodeId)!

    adjacency.get(nodeId)?.forEach(neighborId => {
      if (!levels.has(neighborId)) {
        levels.set(neighborId, currentLevel + 1)
        queue.push(neighborId)
      }
    })
  }

  // Handle disconnected nodes - put them far away
  let maxLevel = 0
  levels.forEach(l => { if (l > maxLevel) maxLevel = l })
  nodes.forEach(n => {
    if (!levels.has(n.id)) {
      levels.set(n.id, maxLevel + 2)
    }
  })

  // Group by level
  const levelGroups = new Map<number, string[]>()
  levels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) levelGroups.set(level, [])
    levelGroups.get(level)!.push(nodeId)
  })

  // Position in concentric circles
  const positionedNodes = nodes.map(node => {
    const level = levels.get(node.id) || 0
    const levelNodes = levelGroups.get(level) || []
    const index = levelNodes.indexOf(node.id)

    // Center node
    if (level === 0) {
      return { ...node, position: { x: 0, y: 0 } }
    }

    const radius = level * levelSpacing
    const angleStep = (2 * Math.PI) / levelNodes.length
    // Start from top, distribute evenly
    const angle = index * angleStep - Math.PI / 2

    return {
      ...node,
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      },
    }
  })

  return { nodes: positionedNodes, edges }
}

/**
 * Linear/tree layout based on prerequisite edges
 * Used in Path mode
 */
function pathLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): LayoutResult {
  const nodeSpacing = options.nodeSpacing || DEFAULT_NODE_SPACING
  const levelSpacing = options.levelSpacing || DEFAULT_LEVEL_SPACING

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

  // If no roots, use all nodes
  if (roots.length === 0) {
    return forceDirectedLayout(nodes, edges, options)
  }

  // BFS to assign levels
  const levels = new Map<string, number>()
  const queue = [...roots.map(r => r.id)]
  roots.forEach(r => levels.set(r.id, 0))

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const currentLevel = levels.get(nodeId)!

    outgoing.get(nodeId)?.forEach(targetId => {
      const existingLevel = levels.get(targetId)
      // Take maximum level (in case of multiple prerequisites)
      if (existingLevel === undefined || currentLevel + 1 > existingLevel) {
        levels.set(targetId, currentLevel + 1)
        if (!queue.includes(targetId)) {
          queue.push(targetId)
        }
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
    levelGroups.get(level)!.push(nodeId)
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
    adjacency.get(e.source)!.add(e.target)
    adjacency.get(e.target)!.add(e.source)
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
export function getEdgesBetweenNodes(
  edges: Edge[],
  nodeIds: Set<string>
): Edge[] {
  return edges.filter(e =>
    nodeIds.has(e.source) && nodeIds.has(e.target)
  )
}
