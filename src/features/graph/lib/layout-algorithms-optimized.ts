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
  const { viewMode, spacingPercent = 100, directionStrength = 100, ignoreExistingPositions = false } = options

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

const runForceDirectedCore = (
  nodes: Node[],
  edges: Edge[],
  options: InternalLayoutOptions
) => {
  const { nodeSpacing } = options
  const iterations = 150
  const idealDistance = nodeSpacing * 1.5
  const idealDistanceSq = idealDistance * idealDistance
  const coolingFactor = 0.97
  const theta = 0.9

  // Initialize positions
  const positions = nodes.map((n, i) => {
    const hasValidPosition = !options.ignoreExistingPositions &&
      n.position && (n.position.x !== 0 || n.position.y !== 0)

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
  if (positions.length === 0) return

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
    if (visited.has(p.id)) return

    const component: string[] = []
    const queue = [p.id]

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      if (visited.has(nodeId)) continue

      visited.add(nodeId)
      component.push(nodeId)

      adjacency.get(nodeId)?.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          queue.push(neighborId)
        }
      })
    }

    components.push(component)
  })

  // If only one component, nothing to do
  if (components.length <= 1) return

  // Sort components by size (largest first = main cluster)
  components.sort((a, b) => b.length - a.length)

  const posMap = new Map(positions.map(p => [p.id, p]))

  // Calculate bounding box of main component
  const mainComponent = components[0]
  let mainMinX = Infinity, mainMaxX = -Infinity
  let mainMinY = Infinity, mainMaxY = -Infinity

  mainComponent.forEach(id => {
    const pos = posMap.get(id)!
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
    let compMinX = Infinity, compMaxX = -Infinity
    let compMinY = Infinity, compMaxY = -Infinity

    component.forEach(id => {
      const pos = posMap.get(id)!
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
      const pos = posMap.get(id)!
      pos.x += offsetX
      pos.y += offsetY
    })

    placementAngle += angleStep
  }
}

// ============================================================================
// PATH LAYOUT HELPER FUNCTIONS
// ============================================================================

interface WeightedAdjacency {
  outgoing: Map<string, Array<{ target: string; weight: number }>>
  incoming: Map<string, Array<{ source: string; weight: number }>>
}

/**
 * Build weighted adjacency graph from ALL edge types
 */
const buildWeightedGraph = (nodes: Node[], edges: Edge[]): WeightedAdjacency => {
  const outgoing = new Map<string, Array<{ target: string; weight: number }>>()
  const incoming = new Map<string, Array<{ source: string; weight: number }>>()

  nodes.forEach(n => {
    outgoing.set(n.id, [])
    incoming.set(n.id, [])
  })

  edges.forEach(e => {
    const relationType = (e.data?.relationType as RelationType) || 'related-to'
    const weight = EDGE_WEIGHTS[relationType] || 0.3

    outgoing.get(e.source)?.push({ target: e.target, weight })
    incoming.get(e.target)?.push({ source: e.source, weight })
  })

  return { outgoing, incoming }
}

/**
 * Find root nodes (nodes with no incoming edges or lowest incoming weight)
 * Also handles cycles by picking nodes with highest out-degree
 */
const findRoots = (nodes: Node[], adjacency: WeightedAdjacency): string[] => {
  const { incoming, outgoing } = adjacency

  // First: nodes with no incoming edges
  const pureRoots = nodes.filter(n => (incoming.get(n.id)?.length || 0) === 0)

  if (pureRoots.length > 0) {
    return pureRoots.map(n => n.id)
  }

  // Cycle case: pick node with highest (out-degree - in-degree)
  let bestNode = nodes[0]?.id
  let bestScore = -Infinity

  nodes.forEach(n => {
    const outDegree = outgoing.get(n.id)?.length || 0
    const inDegree = incoming.get(n.id)?.length || 0
    const score = outDegree - inDegree
    if (score > bestScore) {
      bestScore = score
      bestNode = n.id
    }
  })

  return bestNode ? [bestNode] : []
}

/**
 * Calculate levels using weighted BFS
 * Higher weight edges have priority in determining level distance
 */
const calculateWeightedLevels = (
  roots: string[],
  adjacency: WeightedAdjacency,
  nodeIds: string[]
): Map<string, number> => {
  const { outgoing } = adjacency
  const levels = new Map<string, number>()
  const visited = new Set<string>()

  // Priority queue: [nodeId, level, priority]
  // Higher priority = process first
  const queue: Array<{ nodeId: string; level: number; priority: number }> = []

  roots.forEach(rootId => {
    queue.push({ nodeId: rootId, level: 0, priority: 1 })
    levels.set(rootId, 0)
    visited.add(rootId)
  })

  while (queue.length > 0) {
    // Sort by priority descending (higher priority first)
    queue.sort((a, b) => b.priority - a.priority)
    const { nodeId, level } = queue.shift()!

    const neighbors = outgoing.get(nodeId) || []
    neighbors.forEach(({ target, weight }) => {
      if (!visited.has(target)) {
        visited.add(target)
        levels.set(target, level + 1)
        queue.push({ nodeId: target, level: level + 1, priority: weight })
      }
    })
  }

  // Handle disconnected nodes
  let maxLevel = 0
  levels.forEach(l => {
    if (l > maxLevel) maxLevel = l
  })

  // Place disconnected nodes at the end
  nodeIds.forEach(id => {
    if (!levels.has(id)) {
      levels.set(id, maxLevel + 1)
    }
  })

  return levels
}

/**
 * Barycenter method to minimize edge crossings
 * Orders nodes within each level by average position of their neighbors
 */
const minimizeCrossings = (
  levels: Map<string, number>,
  adjacency: WeightedAdjacency,
  iterations = 4
): Map<number, string[]> => {
  const { outgoing, incoming } = adjacency

  // Group nodes by level
  const levelGroups = new Map<number, string[]>()
  levels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, [])
    }
    levelGroups.get(level)!.push(nodeId)
  })

  // Get all level numbers sorted
  const levelNumbers = Array.from(levelGroups.keys()).sort((a, b) => a - b)

  // Initial ordering: arbitrary (by insertion order)
  const nodePositions = new Map<string, number>()
  levelGroups.forEach(group => {
    group.forEach((nodeId, idx) => {
      nodePositions.set(nodeId, idx)
    })
  })

  // Barycenter iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Forward sweep (left to right)
    for (let i = 1; i < levelNumbers.length; i++) {
      const currentLevel = levelNumbers[i]
      const nodesInLevel = levelGroups.get(currentLevel)!

      // Calculate barycenter for each node
      const barycenters = nodesInLevel.map(nodeId => {
        const incomingEdges = incoming.get(nodeId) || []
        if (incomingEdges.length === 0) {
          return { nodeId, barycenter: nodePositions.get(nodeId) || 0 }
        }

        let sum = 0
        let totalWeight = 0
        incomingEdges.forEach(({ source, weight }) => {
          sum += (nodePositions.get(source) || 0) * weight
          totalWeight += weight
        })

        return {
          nodeId,
          barycenter: totalWeight > 0 ? sum / totalWeight : (nodePositions.get(nodeId) || 0)
        }
      })

      // Sort by barycenter
      barycenters.sort((a, b) => a.barycenter - b.barycenter)

      // Update positions
      barycenters.forEach(({ nodeId }, idx) => {
        nodePositions.set(nodeId, idx)
      })
      levelGroups.set(
        currentLevel,
        barycenters.map(b => b.nodeId)
      )
    }

    // Backward sweep (right to left)
    for (let i = levelNumbers.length - 2; i >= 0; i--) {
      const currentLevel = levelNumbers[i]
      const nodesInLevel = levelGroups.get(currentLevel)!

      const barycenters = nodesInLevel.map(nodeId => {
        const outgoingEdges = outgoing.get(nodeId) || []
        if (outgoingEdges.length === 0) {
          return { nodeId, barycenter: nodePositions.get(nodeId) || 0 }
        }

        let sum = 0
        let totalWeight = 0
        outgoingEdges.forEach(({ target, weight }) => {
          sum += (nodePositions.get(target) || 0) * weight
          totalWeight += weight
        })

        return {
          nodeId,
          barycenter: totalWeight > 0 ? sum / totalWeight : (nodePositions.get(nodeId) || 0)
        }
      })

      barycenters.sort((a, b) => a.barycenter - b.barycenter)
      barycenters.forEach(({ nodeId }, idx) => {
        nodePositions.set(nodeId, idx)
      })
      levelGroups.set(
        currentLevel,
        barycenters.map(b => b.nodeId)
      )
    }
  }

  return levelGroups
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

  if (flexibility <= 0) return

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
      if (!posS || !posT) return

      const dy = posT.y - posS.y
      const force = dy * 0.05 * flexibility

      const forceS = forces.get(e.source)
      const forceT = forces.get(e.target)
      if (forceS) forceS.fy += force
      if (forceT) forceT.fy -= force
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
// MAIN PATH LAYOUT ALGORITHM
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

  // 2. Find roots (nodes with no incoming edges)
  const roots = findRoots(nodes, adjacency)

  if (roots.length === 0) {
    return forceDirectedLayout(nodes, edges, options)
  }

  // 3. Calculate levels using weighted BFS
  const nodeIds = nodes.map(n => n.id)
  const levels = calculateWeightedLevels(roots, adjacency, nodeIds)

  // 4. Order nodes within levels to minimize edge crossings
  const orderedLevels = minimizeCrossings(levels, adjacency)

  // 5. Calculate actual spacing based on directionStrength
  // Higher strength = more spacing
  const effectiveLevelSpacing = levelSpacing * (0.5 + directionStrength * 0.5)
  const effectiveNodeSpacing = nodeSpacing * (0.5 + directionStrength * 0.5)

  // 6. Position nodes
  const positions = new Map<string, { x: number; y: number }>()

  orderedLevels.forEach((nodesInLevel, level) => {
    const levelHeight = nodesInLevel.length * effectiveNodeSpacing

    nodesInLevel.forEach((nodeId, indexInLevel) => {
      positions.set(nodeId, {
        x: level * effectiveLevelSpacing,
        y: indexInLevel * effectiveNodeSpacing - levelHeight / 2 + effectiveNodeSpacing / 2
      })
    })
  })

  // 7. If directionStrength < 1, apply soft force-directed refinement
  if (directionStrength < 1) {
    refineWithForces(positions, edges, directionStrength, nodeSpacing)
  }

  // 8. Handle disconnected components - spread them vertically
  const componentOffsets = new Map<number, number>()
  let componentOffset = 0
  const visited = new Set<string>()

  orderedLevels.forEach((nodesInLevel, level) => {
    if (level === 0) {
      // For each root, track its component
      nodesInLevel.forEach((rootId, idx) => {
        if (!visited.has(rootId)) {
          // BFS to mark all nodes in this component
          const queue = [rootId]
          const componentNodes: string[] = []

          while (queue.length > 0) {
            const nodeId = queue.shift()!
            if (visited.has(nodeId)) continue
            visited.add(nodeId)
            componentNodes.push(nodeId)

            const outEdges = adjacency.outgoing.get(nodeId) || []
            const inEdges = adjacency.incoming.get(nodeId) || []

            outEdges.forEach(({ target }) => {
              if (!visited.has(target)) queue.push(target)
            })
            inEdges.forEach(({ source }) => {
              if (!visited.has(source)) queue.push(source)
            })
          }

          // Calculate component height and offset
          let minY = Infinity,
            maxY = -Infinity
          componentNodes.forEach(id => {
            const pos = positions.get(id)
            if (pos) {
              minY = Math.min(minY, pos.y)
              maxY = Math.max(maxY, pos.y)
            }
          })

          const componentHeight = maxY - minY + effectiveNodeSpacing
          componentNodes.forEach(id => {
            const pos = positions.get(id)
            if (pos) {
              pos.y += componentOffset - minY
            }
          })

          componentOffset += componentHeight + effectiveNodeSpacing
        }
      })
    }
  })

  // 9. Apply positions to nodes
  const positionedNodes = nodes.map(node => {
    const pos = positions.get(node.id) || { x: 0, y: 0 }
    return {
      ...node,
      position: { x: pos.x, y: pos.y }
    }
  })

  return { nodes: positionedNodes, edges }
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
