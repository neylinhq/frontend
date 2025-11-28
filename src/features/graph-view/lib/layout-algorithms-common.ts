import type { Edge, Node } from '@xyflow/react'
import type { RelationType } from '@/entities/edge'

export const DEFAULT_NODE_SPACING = 200
export const DEFAULT_LEVEL_SPACING = 300

// Edge weights for clustering - prerequisite is strongest
export const EDGE_WEIGHTS: Record<RelationType, number> = {
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

export interface InternalLayoutOptions {
  nodeSpacing: number
  levelSpacing: number
  directionStrength: number // 0-2 (normalized from 0-200)
}

/**
 * Linear/tree layout based on prerequisite edges
 * Used in Path mode
 */
export function pathLayout(
  nodes: Node[],
  edges: Edge[],
  options: InternalLayoutOptions,
  fallbackLayout: (
    nodes: Node[],
    edges: Edge[],
    options: InternalLayoutOptions
  ) => { nodes: Node[]; edges: Edge[] }
): { nodes: Node[]; edges: Edge[] } {
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
    return fallbackLayout(nodes, edges, options)
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
