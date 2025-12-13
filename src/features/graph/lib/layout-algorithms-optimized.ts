/**
 * Optimized force-directed layout with Barnes-Hut quadtree
 * FIXES:
 * - Added jitter to initialization to prevent vertical collapse on updates
 * - Strengthened horizontal spread force
 * - Added overlap protection in repulsion
 */

import type { Edge, Node } from '@xyflow/react'
import type { RelationType } from '@/entities/edge'
import type { ViewMode } from '../model/graph.store'

interface LayoutOptions {
  viewMode: ViewMode
  focusedNodeId?: string | null
  spacingPercent?: number
  directionStrength?: number
  ignoreExistingPositions?: boolean
}

interface LayoutResult {
  nodes: Node[]
  edges: Edge[]
}

const DEFAULT_NODE_SPACING = 200
const DEFAULT_LEVEL_SPACING = 300

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

const hashToSide = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash % 2 === 0 ? -1 : 1
}

// ============================================================================
// QUADTREE IMPLEMENTATION FOR BARNES-HUT
// ============================================================================

interface QuadNode {
  x: number
  y: number
  width: number
  height: number
  cx: number
  cy: number
  mass: number
  children: [QuadNode | null, QuadNode | null, QuadNode | null, QuadNode | null] | null
  body: { x: number; y: number } | null
}

const createQuadNode = (x: number, y: number, width: number, height: number) => {
  return {
    x,
    y,
    width,
    height,
    cx: 0,
    cy: 0,
    mass: 0,
    children: null,
    body: null
  }
}

const getQuadrant = (node: QuadNode, px: number, py: number) => {
  const midX = node.x + node.width / 2
  const midY = node.y + node.height / 2
  const west = px < midX
  const north = py < midY
  if (north) {
    return west ? 0 : 1 // NW : NE
  }
  return west ? 2 : 3 // SW : SE
}

const MAX_QUADTREE_DEPTH = 20

const insertIntoQuadtree = (node: QuadNode, px: number, py: number, depth = 0) => {
  if (node.mass === 0 && node.body === null) {
    node.body = { x: px, y: py }
    node.cx = px
    node.cy = py
    node.mass = 1
    return
  }

  if (depth >= MAX_QUADTREE_DEPTH) {
    const totalMass = node.mass + 1
    node.cx = (node.cx * node.mass + px) / totalMass
    node.cy = (node.cy * node.mass + py) / totalMass
    node.mass = totalMass
    return
  }

  if (node.body !== null) {
    const oldBody = node.body
    node.body = null
    node.children = [null, null, null, null]
    insertIntoChild(node, oldBody.x, oldBody.y, depth)
  }

  insertIntoChild(node, px, py, depth)

  const totalMass = node.mass + 1
  node.cx = (node.cx * node.mass + px) / totalMass
  node.cy = (node.cy * node.mass + py) / totalMass
  node.mass = totalMass
}

const insertIntoChild = (node: QuadNode, px: number, py: number, depth: number) => {
  if (!node.children) {
    return
  }

  const quadrant = getQuadrant(node, px, py)
  const halfW = node.width / 2
  const halfH = node.height / 2

  if (node.children[quadrant] === null) {
    const childX = node.x + (quadrant % 2 === 1 ? halfW : 0)
    const childY = node.y + (quadrant >= 2 ? halfH : 0)
    node.children[quadrant] = createQuadNode(childX, childY, halfW, halfH)
  }

  insertIntoQuadtree(node.children[quadrant]!, px, py, depth + 1)
}

const buildQuadtree = (positions: { x: number; y: number }[]) => {
  if (positions.length === 0) {
    return createQuadNode(0, 0, 1, 1)
  }

  let minX = Infinity,
    maxX = -Infinity
  let minY = Infinity,
    maxY = -Infinity
  for (const p of positions) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  const padding = 100
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding
  const size = Math.max(maxX - minX, maxY - minY)

  const root = createQuadNode(minX, minY, size, size)

  for (const p of positions) {
    insertIntoQuadtree(root, p.x, p.y)
  }

  return root
}

const calculateRepulsionBarnesHut = (
  node: QuadNode,
  px: number,
  py: number,
  idealDistanceSq: number,
  theta: number
) => {
  let fx = 0
  let fy = 0

  if (node.mass === 0) {
    return { fx: 0, fy: 0 }
  }

  const dx = node.cx - px
  const dy = node.cy - py
  const distSq = dx * dx + dy * dy

  // FIX: If perfectly overlapping or extremely close, force random separation
  if (distSq < 0.1) {
    if (node.children) {
      for (const child of node.children) {
        if (child) {
          const cf = calculateRepulsionBarnesHut(child, px, py, idealDistanceSq, theta)
          fx += cf.fx
          fy += cf.fy
        }
      }
    } else {
      // "Explosion" force for overlapping nodes
      fx = (Math.random() - 0.5) * 50
      fy = (Math.random() - 0.5) * 50
    }
    return { fx, fy }
  }

  const dist = Math.sqrt(distSq)
  const cellSize = node.width

  if (node.body !== null || cellSize / dist < theta) {
    // Standard repulsion
    const force = (idealDistanceSq / dist) * node.mass
    fx = -(dx / dist) * force
    fy = -(dy / dist) * force
  } else if (node.children) {
    for (const child of node.children) {
      if (child) {
        const cf = calculateRepulsionBarnesHut(child, px, py, idealDistanceSq, theta)
        fx += cf.fx
        fy += cf.fy
      }
    }
  }

  return { fx, fy }
}

// ============================================================================
// MAIN LAYOUT ALGORITHM
// ============================================================================

interface InternalLayoutOptions {
  nodeSpacing: number
  levelSpacing: number
  directionStrength: number
  ignoreExistingPositions: boolean
}

export const applyLayout = (nodes: Node[], edges: Edge[], options: LayoutOptions) => {
  const {
    viewMode,
    spacingPercent = 100,
    directionStrength = 100,
    ignoreExistingPositions = false
  } = options

  if (nodes.length === 0) {
    return { nodes, edges }
  }

  const spacingFactor = spacingPercent / 100
  const nodeSpacing = DEFAULT_NODE_SPACING * spacingFactor
  const levelSpacing = DEFAULT_LEVEL_SPACING * spacingFactor
  const normalizedDirection = directionStrength / 100

  const internalOptions: InternalLayoutOptions = {
    nodeSpacing,
    levelSpacing,
    directionStrength: normalizedDirection,
    ignoreExistingPositions
  }

  switch (viewMode) {
    case 'focus':
      return forceDirectedLayout(nodes, edges, internalOptions)
    case 'path':
      return pathLayout(nodes, edges, internalOptions)
    default:
      return forceDirectedLayout(nodes, edges, internalOptions)
  }
}

const forceDirectedLayout = (nodes: Node[], edges: Edge[], options: InternalLayoutOptions) => {
  return runForceDirectedCore(nodes, edges, options)
}

const runForceDirectedCore = (nodes: Node[], edges: Edge[], options: InternalLayoutOptions) => {
  const { nodeSpacing } = options
  const iterations = 150
  const idealDistance = nodeSpacing * 1.5
  const idealDistanceSq = idealDistance * idealDistance
  const coolingFactor = 0.97
  const theta = 0.9

  // Initialize positions
  const positions = nodes.map((n, i) => {
    const hasValidPosition =
      !options.ignoreExistingPositions && n.position && (n.position.x !== 0 || n.position.y !== 0)

    if (hasValidPosition) {
      // Use saved positions with small jitter to help break symmetry
      return {
        id: n.id,
        x: n.position.x + (Math.random() - 0.5) * 10,
        y: n.position.y,
        vx: 0,
        vy: 0
      }
    }

    // Circle layout for initial positions (better than random)
    const angle = (i / nodes.length) * 2 * Math.PI
    const radius = Math.sqrt(nodes.length) * nodeSpacing * 0.5

    return {
      id: n.id,
      x: Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
      y: Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
      vx: 0,
      vy: 0
    }
  })

  const posMap = new Map(positions.map(p => [p.id, p]))

  let temperature = idealDistance * 0.5

  for (let iter = 0; iter < iterations; iter++) {
    // ========================================
    // REPULSIVE FORCES
    // ========================================
    const quadtree = buildQuadtree(positions)

    for (const p of positions) {
      const { fx, fy } = calculateRepulsionBarnesHut(quadtree, p.x, p.y, idealDistanceSq, theta)
      p.vx += fx
      p.vy += fy
    }

    // ========================================
    // ATTRACTIVE FORCES
    // ========================================
    edges.forEach(e => {
      const source = posMap.get(e.source)
      const target = posMap.get(e.target)
      if (!source || !target) {
        return
      }

      const dx = target.x - source.x
      const dy = target.y - source.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01

      const relationType = (e.data?.relationType as RelationType) || 'related-to'
      const weight = EDGE_WEIGHTS[relationType] || 0.3

      // Standard attraction
      const force = ((dist * dist) / idealDistance) * weight
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      source.vx += fx
      source.vy += fy
      target.vx -= fx
      target.vy -= fy

      // Direction force when directionStrength > 0
      if (options.directionStrength > 0) {
        const yDiff = Math.abs(target.y - source.y)
        const verticalForce = idealDistance * 1.2 * options.directionStrength * weight
        source.vy -= verticalForce
        target.vy += verticalForce

        // Horizontal spread for hierarchy
        if (yDiff < idealDistance * 0.8) {
          const spreadForce = idealDistance * 0.5 * options.directionStrength
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

    // ========================================
    // CENTER GRAVITY
    // ========================================
    const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length
    const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length
    positions.forEach(p => {
      p.vx -= (p.x - centerX) * 0.01
      p.vy -= (p.y - centerY) * 0.01
    })

    // ========================================
    // HORIZONTAL SPREAD (only when direction is active)
    // ========================================
    if (options.directionStrength > 0) {
      const spreadStrength = 0.2 * options.directionStrength

      positions.forEach(p => {
        const bias = hashToSide(p.id)
        const targetX = bias * idealDistance
        p.vx += (targetX - p.x) * spreadStrength
      })
    }

    // ========================================
    // APPLY VELOCITIES
    // ========================================
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

  // ========================================
  // POST-PROCESS: Reposition isolated components
  // ========================================
  repositionIsolatedComponents(positions, edges, nodeSpacing)

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
 * Find connected components and reposition isolated ones near the main cluster
 */
const repositionIsolatedComponents = (
  positions: Array<{ id: string; x: number; y: number }>,
  edges: Edge[],
  nodeSpacing: number
) => {
  if (positions.length === 0) {
    return
  }

  // Build adjacency for component detection
  const adjacency = new Map<string, Set<string>>()
  positions.forEach(p => adjacency.set(p.id, new Set()))

  edges.forEach(e => {
    adjacency.get(e.source)?.add(e.target)
    adjacency.get(e.target)?.add(e.source)
  })

  // Find all connected components using BFS
  const visited = new Set<string>()
  const components: string[][] = []

  positions.forEach(p => {
    if (visited.has(p.id)) {
      return
    }

    const component: string[] = []
    const queue = [p.id]

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      if (visited.has(nodeId)) {
        continue
      }

      visited.add(nodeId)
      component.push(nodeId)

      adjacency.get(nodeId)?.forEach(neighborId => {
        // Only add neighbors that exist in positions (edges may reference filtered-out nodes)
        if (!visited.has(neighborId) && adjacency.has(neighborId)) {
          queue.push(neighborId)
        }
      })
    }

    components.push(component)
  })

  // If only one component, nothing to do
  if (components.length <= 1) {
    return
  }

  // Sort components by size (largest first = main cluster)
  components.sort((a, b) => b.length - a.length)

  const posMap = new Map(positions.map(p => [p.id, p]))

  // Calculate bounding box of main component
  const mainComponent = components[0]
  let mainMinX = Infinity,
    mainMaxX = -Infinity
  let mainMinY = Infinity,
    mainMaxY = -Infinity

  mainComponent.forEach(id => {
    const pos = posMap.get(id)
    if (!pos) {
      return // Skip nodes not in positions
    }
    mainMinX = Math.min(mainMinX, pos.x)
    mainMaxX = Math.max(mainMaxX, pos.x)
    mainMinY = Math.min(mainMinY, pos.y)
    mainMaxY = Math.max(mainMaxY, pos.y)
  })

  const mainWidth = mainMaxX - mainMinX
  const mainHeight = mainMaxY - mainMinY
  const mainCenterX = (mainMinX + mainMaxX) / 2
  const mainCenterY = (mainMinY + mainMaxY) / 2

  // Gap between main cluster and isolated components
  const gap = nodeSpacing * 1.5

  // Place isolated components around the main cluster
  // Use a spiral-like placement starting from the right side
  let placementAngle = 0
  // Dynamic angle step based on number of components
  const numIsolated = components.length - 1
  const angleStep = (2 * Math.PI) / Math.max(numIsolated, 6)

  for (let i = 1; i < components.length; i++) {
    const component = components[i]

    // Calculate component's current bounding box
    let compMinX = Infinity,
      compMaxX = -Infinity
    let compMinY = Infinity,
      compMaxY = -Infinity

    component.forEach(id => {
      const pos = posMap.get(id)
      if (!pos) {
        return
      }
      compMinX = Math.min(compMinX, pos.x)
      compMaxX = Math.max(compMaxX, pos.x)
      compMinY = Math.min(compMinY, pos.y)
      compMaxY = Math.max(compMaxY, pos.y)
    })

    const compWidth = compMaxX - compMinX
    const compHeight = compMaxY - compMinY
    const compCenterX = (compMinX + compMaxX) / 2
    const compCenterY = (compMinY + compMaxY) / 2

    // Calculate target position based on angle around main cluster
    // Distance from main center = half of main diagonal + gap + half of component size
    const mainRadius = Math.sqrt(mainWidth * mainWidth + mainHeight * mainHeight) / 2
    // Minimum radius for single nodes so they don't overlap
    const compRadius = Math.max(
      Math.sqrt(compWidth * compWidth + compHeight * compHeight) / 2,
      nodeSpacing * 0.5 // Minimum radius for single nodes
    )
    const distance = mainRadius + gap + compRadius

    const targetX = mainCenterX + Math.cos(placementAngle) * distance
    const targetY = mainCenterY + Math.sin(placementAngle) * distance

    // Calculate offset to move component
    const offsetX = targetX - compCenterX
    const offsetY = targetY - compCenterY

    // Apply offset to all nodes in component
    component.forEach(id => {
      const pos = posMap.get(id)
      if (!pos) {
        return
      }
      pos.x += offsetX
      pos.y += offsetY
    })

    placementAngle += angleStep
  }
}

// ============================================================================
// PATH LAYOUT - IDEAL LEARNING PATH VISUALIZATION
// ============================================================================
//
// Creates a beautiful "spine + branches" layout optimized for learning:
// - Finds the longest prerequisite chain as the main "spine" (learning path)
// - Places spine nodes horizontally at Y=0
// - Branches off the spine go up (generalizations) or down (details/examples)
// - Minimizes edge crossings using barycenter heuristic
// - Handles disconnected components gracefully
//
// Visual result:
//                 [Generalization]
//                       ↑ is-a
//   [Start] → [Basic] → [Core] → [Advanced] → [Apply]  ← Main spine (Y=0)
//               ↓          ↓
//           [Example]  [Detail]
//                         ↓
//                    [Sub-detail]

// Edge types that indicate "upward" relationships (generalizations, alternatives)
const UPWARD_EDGE_TYPES: RelationType[] = ['is-a', 'similar-to', 'contradicts']

// Edge types that indicate "downward" relationships (details, examples)
const DOWNWARD_EDGE_TYPES: RelationType[] = ['explains', 'has-a', 'part-of', 'causes', 'influences']

interface WeightedAdjacency {
  outgoing: Map<string, Array<{ target: string; weight: number; type: RelationType }>>
  incoming: Map<string, Array<{ source: string; weight: number; type: RelationType }>>
}

/**
 * Build weighted adjacency graph from ALL edge types
 * Now also tracks edge type for branch direction
 */
const buildWeightedGraph = (nodes: Node[], edges: Edge[]): WeightedAdjacency => {
  const outgoing = new Map<string, Array<{ target: string; weight: number; type: RelationType }>>()
  const incoming = new Map<string, Array<{ source: string; weight: number; type: RelationType }>>()

  nodes.forEach(n => {
    outgoing.set(n.id, [])
    incoming.set(n.id, [])
  })

  edges.forEach(e => {
    const relationType = (e.data?.relationType as RelationType) || 'related-to'
    const weight = EDGE_WEIGHTS[relationType] || 0.3

    outgoing.get(e.source)?.push({ target: e.target, weight, type: relationType })
    incoming.get(e.target)?.push({ source: e.source, weight, type: relationType })
  })

  return { outgoing, incoming }
}

/**
 * Find the longest path through prerequisite edges (the "spine")
 * Uses DFS with memoization for efficiency
 */
const findLongestPrerequisitePath = (nodes: Node[], adjacency: WeightedAdjacency): string[] => {
  const { outgoing, incoming } = adjacency

  // Find root nodes (no incoming prerequisite edges)
  const roots = nodes.filter(n => {
    const inEdges = incoming.get(n.id) || []
    return !inEdges.some(e => e.type === 'prerequisite')
  })

  if (roots.length === 0) {
    // Cycle or no prerequisites - pick node with most outgoing prerequisites
    let bestRoot = nodes[0]?.id
    let maxOut = 0
    nodes.forEach(n => {
      const outPrereqs = (outgoing.get(n.id) || []).filter(e => e.type === 'prerequisite').length
      if (outPrereqs > maxOut) {
        maxOut = outPrereqs
        bestRoot = n.id
      }
    })
    if (bestRoot) {
      roots.push(nodes.find(n => n.id === bestRoot)!)
    }
  }

  // DFS to find longest path from each root
  const memo = new Map<string, string[]>()
  const visited = new Set<string>()

  const dfs = (nodeId: string): string[] => {
    if (memo.has(nodeId)) {
      return memo.get(nodeId)!
    }
    if (visited.has(nodeId)) {
      return [nodeId] // Cycle detected
    }

    visited.add(nodeId)

    const prereqTargets = (outgoing.get(nodeId) || [])
      .filter(e => e.type === 'prerequisite')
      .map(e => e.target)

    if (prereqTargets.length === 0) {
      const result = [nodeId]
      memo.set(nodeId, result)
      visited.delete(nodeId)
      return result
    }

    let longestContinuation: string[] = []
    prereqTargets.forEach(target => {
      const continuation = dfs(target)
      if (continuation.length > longestContinuation.length) {
        longestContinuation = continuation
      }
    })

    const result = [nodeId, ...longestContinuation]
    memo.set(nodeId, result)
    visited.delete(nodeId)
    return result
  }

  let longestPath: string[] = []
  roots.forEach(root => {
    const path = dfs(root.id)
    if (path.length > longestPath.length) {
      longestPath = path
    }
  })

  // If no prerequisites found, use weighted BFS to create a sensible ordering
  if (longestPath.length <= 1 && nodes.length > 1) {
    return createFallbackSpine(nodes, adjacency)
  }

  return longestPath
}

/**
 * Create fallback spine when no prerequisites exist
 * Uses most connected nodes as spine
 */
const createFallbackSpine = (nodes: Node[], adjacency: WeightedAdjacency): string[] => {
  const { outgoing, incoming } = adjacency

  // Score nodes by connectivity
  const scores = new Map<string, number>()
  nodes.forEach(n => {
    const outDegree = outgoing.get(n.id)?.length || 0
    const inDegree = incoming.get(n.id)?.length || 0
    scores.set(n.id, outDegree + inDegree)
  })

  // Find node with most connections as start
  let startNode = nodes[0]?.id
  let maxScore = 0
  scores.forEach((score, id) => {
    if (score > maxScore) {
      maxScore = score
      startNode = id
    }
  })

  if (!startNode) {
    return []
  }

  // BFS from start, following highest-weight edges
  const spine: string[] = [startNode]
  const used = new Set([startNode])

  while (spine.length < Math.min(nodes.length, 10)) {
    const current = spine[spine.length - 1]
    const neighbors = outgoing.get(current) || []

    // Find best unused neighbor
    let bestNeighbor: string | null = null
    let bestWeight = -1

    neighbors.forEach(({ target, weight }) => {
      if (!used.has(target) && weight > bestWeight) {
        bestWeight = weight
        bestNeighbor = target
      }
    })

    if (!bestNeighbor) {
      break
    }

    spine.push(bestNeighbor)
    used.add(bestNeighbor)
  }

  return spine
}

/**
 * Determine branch direction for a node based on how it connects to spine
 * Returns: -1 for up (generalizations), 1 for down (details), 0 for spine
 */
const _getBranchDirection = (
  nodeId: string,
  spineSet: Set<string>,
  adjacency: WeightedAdjacency
): number => {
  if (spineSet.has(nodeId)) {
    return 0
  }

  const { incoming } = adjacency
  const inEdges = incoming.get(nodeId) || []

  // Check edge types from spine nodes
  for (const edge of inEdges) {
    if (spineSet.has(edge.source)) {
      if (UPWARD_EDGE_TYPES.includes(edge.type)) {
        return -1
      }
      if (DOWNWARD_EDGE_TYPES.includes(edge.type)) {
        return 1
      }
    }
  }

  // Default: down
  return 1
}

/**
 * Calculate branch depth (how far from spine)
 */
const calculateBranchDepths = (
  nodes: Node[],
  spine: string[],
  adjacency: WeightedAdjacency
): Map<string, { level: number; depth: number; direction: number }> => {
  const _spineSet = new Set(spine)
  const result = new Map<string, { level: number; depth: number; direction: number }>()

  // Initialize spine nodes at depth 0
  spine.forEach((id, idx) => {
    result.set(id, { level: idx, depth: 0, direction: 0 })
  })

  // BFS from spine to assign depths to branches
  const { outgoing, incoming } = adjacency
  const queue: Array<{ id: string; level: number; depth: number; direction: number }> = []

  // Start BFS from each spine node
  spine.forEach((spineId, spineLevel) => {
    const neighbors = [
      ...(outgoing.get(spineId) || []).map(e => ({ id: e.target, type: e.type })),
      ...(incoming.get(spineId) || []).map(e => ({ id: e.source, type: e.type }))
    ]

    neighbors.forEach(({ id, type }) => {
      if (!result.has(id)) {
        const direction = UPWARD_EDGE_TYPES.includes(type) ? -1 : 1
        queue.push({ id, level: spineLevel, depth: 1, direction })
      }
    })
  })

  // Process queue
  while (queue.length > 0) {
    const { id, level, depth, direction } = queue.shift()!

    if (result.has(id)) {
      continue
    }
    result.set(id, { level, depth, direction })

    // Add neighbors at depth + 1
    const neighbors = [
      ...(outgoing.get(id) || []).map(e => ({ id: e.target, type: e.type })),
      ...(incoming.get(id) || []).map(e => ({ id: e.source, type: e.type }))
    ]

    neighbors.forEach(({ id: neighborId, type }) => {
      if (!result.has(neighborId)) {
        // Inherit direction from parent, or determine from edge type
        let neighborDir = direction
        if (UPWARD_EDGE_TYPES.includes(type)) {
          neighborDir = -1
        } else if (DOWNWARD_EDGE_TYPES.includes(type)) {
          neighborDir = 1
        }

        queue.push({ id: neighborId, level, depth: depth + 1, direction: neighborDir })
      }
    })
  }

  // Handle any disconnected nodes
  nodes.forEach(n => {
    if (!result.has(n.id)) {
      result.set(n.id, { level: spine.length, depth: 1, direction: 1 })
    }
  })

  return result
}

/**
 * Apply soft force-directed refinement for organic feel
 * Only applied when directionStrength < 1
 */
const refineWithForces = (
  positions: Map<string, { x: number; y: number }>,
  edges: Edge[],
  strength: number,
  nodeSpacing: number
): void => {
  // How much to allow deviation from strict layout
  const flexibility = 1 - strength // 0 = strict, 1 = fully organic

  if (flexibility <= 0) {
    return
  }

  const iterations = 20
  const idealDistance = nodeSpacing * 0.8

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>()
    positions.forEach((_, id) => forces.set(id, { fx: 0, fy: 0 }))

    // Repulsion between nodes on same level (Y-axis only)
    const posArray = Array.from(positions.entries())
    for (let i = 0; i < posArray.length; i++) {
      for (let j = i + 1; j < posArray.length; j++) {
        const [idA, posA] = posArray[i]
        const [idB, posB] = posArray[j]

        // Only repel if on similar X (same level)
        if (Math.abs(posA.x - posB.x) < idealDistance * 0.5) {
          const dy = posB.y - posA.y
          const dist = Math.abs(dy) || 0.1
          if (dist < idealDistance) {
            const force = ((idealDistance - dist) / dist) * flexibility * 5
            const forceA = forces.get(idA)!
            const forceB = forces.get(idB)!
            forceA.fy -= force
            forceB.fy += force
          }
        }
      }
    }

    // Attraction along edges (Y-axis only to keep hierarchy)
    edges.forEach(e => {
      const posS = positions.get(e.source)
      const posT = positions.get(e.target)
      if (!posS || !posT) {
        return
      }

      const dy = posT.y - posS.y
      const force = dy * 0.05 * flexibility

      const forceS = forces.get(e.source)
      const forceT = forces.get(e.target)
      if (forceS) {
        forceS.fy += force
      }
      if (forceT) {
        forceT.fy -= force
      }
    })

    // Apply forces
    const damping = 1 - iter / iterations
    forces.forEach((f, id) => {
      const pos = positions.get(id)
      if (pos) {
        pos.y += f.fy * damping
      }
    })
  }
}

// ============================================================================
// MAIN PATH LAYOUT ALGORITHM - IDEAL SPINE + BRANCHES
// ============================================================================

const pathLayout = (nodes: Node[], edges: Edge[], options: InternalLayoutOptions): LayoutResult => {
  const { nodeSpacing, levelSpacing, directionStrength } = options

  if (nodes.length === 0) {
    return { nodes, edges }
  }

  // For very low direction strength, use force-directed layout
  if (directionStrength <= 0.1) {
    return forceDirectedLayout(nodes, edges, options)
  }

  // 1. Build weighted adjacency (ALL edge types)
  const adjacency = buildWeightedGraph(nodes, edges)

  // 2. Find the longest prerequisite chain as the "spine"
  const spine = findLongestPrerequisitePath(nodes, adjacency)

  if (spine.length === 0) {
    return forceDirectedLayout(nodes, edges, options)
  }

  // 3. Calculate branch depths and directions for all nodes
  const nodeInfo = calculateBranchDepths(nodes, spine, adjacency)

  // 4. Calculate effective spacing
  const effectiveLevelSpacing = levelSpacing * (0.5 + directionStrength * 0.5)
  const effectiveNodeSpacing = nodeSpacing * (0.5 + directionStrength * 0.5)
  const branchSpacing = effectiveNodeSpacing * 0.8

  // 5. Group nodes by (level, direction) for branch ordering
  // Structure: Map<level, { up: string[], spine: string[], down: string[] }>
  const levelBranches = new Map<number, { up: string[]; spine: string[]; down: string[] }>()

  nodeInfo.forEach(({ level, direction }, nodeId) => {
    if (!levelBranches.has(level)) {
      levelBranches.set(level, { up: [], spine: [], down: [] })
    }
    const branches = levelBranches.get(level)!
    if (direction < 0) {
      branches.up.push(nodeId)
    } else if (direction > 0) {
      branches.down.push(nodeId)
    } else {
      branches.spine.push(nodeId)
    }
  })

  // 6. Sort branches within each level by depth (closer to spine first)
  levelBranches.forEach(branches => {
    const sortByDepth = (a: string, b: string) => {
      const depthA = nodeInfo.get(a)?.depth || 0
      const depthB = nodeInfo.get(b)?.depth || 0
      return depthA - depthB
    }
    branches.up.sort(sortByDepth)
    branches.down.sort(sortByDepth)
  })

  // 7. Position nodes
  const positions = new Map<string, { x: number; y: number }>()

  // Group nodes by depth for proper stacking
  const nodesByDepthAndLevel = new Map<string, string[]>() // key: `${level}-${direction}-${depth}`

  nodeInfo.forEach(({ level, depth, direction }, nodeId) => {
    const key = `${level}-${direction}-${depth}`
    if (!nodesByDepthAndLevel.has(key)) {
      nodesByDepthAndLevel.set(key, [])
    }
    nodesByDepthAndLevel.get(key)?.push(nodeId)
  })

  // Position each node
  nodeInfo.forEach(({ level, depth, direction }, nodeId) => {
    const x = level * effectiveLevelSpacing

    // Y position based on direction and depth
    // Spine at y=0, branches spread up/down
    let y: number

    if (direction === 0) {
      // Spine node - centered
      y = 0
    } else {
      // Branch node - offset based on depth and index within same depth
      const key = `${level}-${direction}-${depth}`
      const sameDepthNodes = nodesByDepthAndLevel.get(key) || [nodeId]
      const indexInDepth = sameDepthNodes.indexOf(nodeId)
      const countAtDepth = sameDepthNodes.length

      // Base offset for this depth level
      const baseY = depth * branchSpacing * direction

      // Spread multiple nodes at same depth horizontally (via small Y offset)
      const spreadOffset = (indexInDepth - (countAtDepth - 1) / 2) * (branchSpacing * 0.5)

      y = baseY + spreadOffset
    }

    positions.set(nodeId, { x, y })
  })

  // 8. Apply barycenter refinement to reduce edge crossings
  const iterations = 4

  for (let iter = 0; iter < iterations; iter++) {
    // Process each level
    const levels = Array.from(levelBranches.keys()).sort((a, b) => a - b)

    levels.forEach(level => {
      const branches = levelBranches.get(level)!

      // Refine upward branches
      if (branches.up.length > 1) {
        refineBranchPositions(branches.up, positions, adjacency, nodeInfo, branchSpacing, -1)
      }

      // Refine downward branches
      if (branches.down.length > 1) {
        refineBranchPositions(branches.down, positions, adjacency, nodeInfo, branchSpacing, 1)
      }
    })
  }

  // 9. Handle disconnected components
  const visited = new Set<string>()
  const components: string[][] = []

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      const component: string[] = []
      const queue = [n.id]

      while (queue.length > 0) {
        const id = queue.shift()!
        if (visited.has(id)) {
          continue
        }
        visited.add(id)
        component.push(id)

        const outEdges = adjacency.outgoing.get(id) || []
        const inEdges = adjacency.incoming.get(id) || []
        outEdges.forEach(({ target }) => {
          if (!visited.has(target)) {
            queue.push(target)
          }
        })
        inEdges.forEach(({ source }) => {
          if (!visited.has(source)) {
            queue.push(source)
          }
        })
      }

      components.push(component)
    }
  })

  // Offset disconnected components vertically
  if (components.length > 1) {
    let currentOffset = 0

    components.forEach((component, idx) => {
      if (idx === 0) {
        // First component (main) - calculate its extent
        let maxY = -Infinity
        component.forEach(id => {
          const pos = positions.get(id)
          if (pos) {
            maxY = Math.max(maxY, pos.y)
          }
        })
        currentOffset = maxY + effectiveNodeSpacing * 2
      } else {
        // Move this component below previous
        let minY = Infinity
        component.forEach(id => {
          const pos = positions.get(id)
          if (pos) {
            minY = Math.min(minY, pos.y)
          }
        })

        const offsetNeeded = currentOffset - minY
        let maxY = -Infinity

        component.forEach(id => {
          const pos = positions.get(id)
          if (pos) {
            pos.y += offsetNeeded
            maxY = Math.max(maxY, pos.y)
          }
        })

        currentOffset = maxY + effectiveNodeSpacing * 2
      }
    })
  }

  // 10. If directionStrength < 1, apply soft organic refinement
  if (directionStrength < 1) {
    refineWithForces(positions, edges, directionStrength, nodeSpacing)
  }

  // 11. Apply positions to nodes
  const positionedNodes = nodes.map(node => {
    const pos = positions.get(node.id) || { x: 0, y: 0 }
    return {
      ...node,
      position: { x: pos.x, y: pos.y }
    }
  })

  return { nodes: positionedNodes, edges }
}

/**
 * Refine branch positions using barycenter to reduce crossings
 */
const refineBranchPositions = (
  branchNodes: string[],
  positions: Map<string, { x: number; y: number }>,
  adjacency: WeightedAdjacency,
  nodeInfo: Map<string, { level: number; depth: number; direction: number }>,
  spacing: number,
  direction: number
): void => {
  const { incoming, outgoing } = adjacency

  // Calculate barycenter for each node
  const barycenters = branchNodes.map(nodeId => {
    const neighbors = [
      ...(incoming.get(nodeId) || []).map(e => e.source),
      ...(outgoing.get(nodeId) || []).map(e => e.target)
    ]

    if (neighbors.length === 0) {
      return { nodeId, barycenter: positions.get(nodeId)?.y || 0 }
    }

    let sum = 0
    let count = 0
    neighbors.forEach(nId => {
      const pos = positions.get(nId)
      if (pos) {
        sum += pos.y
        count++
      }
    })

    return {
      nodeId,
      barycenter: count > 0 ? sum / count : positions.get(nodeId)?.y || 0
    }
  })

  // Sort by barycenter
  barycenters.sort((a, b) => a.barycenter - b.barycenter)

  // Reposition while respecting depth constraints
  barycenters.forEach(({ nodeId }, idx) => {
    const info = nodeInfo.get(nodeId)
    if (!info) {
      return
    }

    const pos = positions.get(nodeId)
    if (!pos) {
      return
    }

    // Keep depth-based base position, adjust within depth group
    const baseY = info.depth * spacing * direction

    // Small adjustment based on barycenter order
    const adjustment = (idx - (barycenters.length - 1) / 2) * (spacing * 0.3)

    pos.y = baseY + adjustment
  })
}

export const getNodesWithinDepth = (startNodeId: string, edges: Edge[], depth: number) => {
  const connected = new Set<string>([startNodeId])
  const adjacency = new Map<string, Set<string>>()

  edges.forEach(e => {
    if (!adjacency.has(e.source)) {
      adjacency.set(e.source, new Set())
    }
    if (!adjacency.has(e.target)) {
      adjacency.set(e.target, new Set())
    }
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

export const getEdgesBetweenNodes = (edges: Edge[], nodeIds: Set<string>) => {
  return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
}
