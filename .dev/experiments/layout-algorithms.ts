import type { Edge, Node } from '@xyflow/react'
import type { RelationType } from '@/entities/edge'
import type { ViewMode } from '@/features/graph'

interface LayoutOptions {
  viewMode: ViewMode
  focusedNodeId?: string | null
  spacingPercent?: number // 50-200%, default 100
  directionStrength?: number // 0-200, default 100 - сила направленности (source выше target)
}

interface LayoutResult {
  nodes: Node[]
  edges: Edge[]
}

const DEFAULT_NODE_SPACING = 200
const DEFAULT_LEVEL_SPACING = 300

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

/**
 * Apply layout based on view mode
 */
export function applyLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
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
    directionStrength: normalizedDirection
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

/**
 * Force-directed layout with weighted edges for clustering
 * Used in Overview mode
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

  // Initialize positions
  // Note: check for valid position (not 0,0) since mock data uses {x:0, y:0} as default
  const positions = nodes.map((n, i) => {
    const hasValidPosition = n.position && (n.position.x !== 0 || n.position.y !== 0)
    return {
      id: n.id,
      x: hasValidPosition ? n.position.x : Math.cos(i * 2.4) * 200 + Math.random() * 50,
      y: hasValidPosition ? n.position.y : Math.sin(i * 2.4) * 200 + Math.random() * 50,
      vx: 0,
      vy: 0
    }
  })

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

      const force = ((dist * dist) / idealDistance) * weight
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      source.vx += fx
      source.vy += fy
      target.vx -= fx
      target.vy -= fy

      // Direction force: source should be ABOVE target (source.y < target.y)
      // This creates hierarchical layout where edges flow top-to-bottom
      if (options.directionStrength > 0) {
        const verticalForce = idealDistance * 1.2 * options.directionStrength * weight
        source.vy -= verticalForce // push source UP (decrease y)
        target.vy += verticalForce // push target DOWN (increase y)

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
    const pos = posMap.get(node.id)
    return {
      ...node,
      position: { x: pos?.x ?? 0, y: pos?.y ?? 0 }
    }
  })

  return { nodes: positionedNodes, edges }
}

/**
 * Linear/tree layout based on prerequisite edges
 * Used in Path mode
 */
function pathLayout(nodes: Node[], edges: Edge[], options: InternalLayoutOptions): LayoutResult {
  const { nodeSpacing, levelSpacing } = options

  // Filter to only prerequisite edges
  const prereqEdges = edges.filter(e => (e.data?.relationType as RelationType) === 'prerequisite')

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
        y: indexInLevel * nodeSpacing - levelHeight / 2 + nodeSpacing / 2
      }
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
export function getEdgesBetweenNodes(edges: Edge[], nodeIds: Set<string>): Edge[] {
  return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
}
