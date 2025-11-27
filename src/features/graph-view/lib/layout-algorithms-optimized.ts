/**
 * Optimized force-directed layout with Barnes-Hut quadtree
 * FIXES:
 * - Added jitter to initialization to prevent vertical collapse on updates
 * - Strengthened horizontal spread force
 * - Added overlap protection in repulsion
 */

import type { Edge, Node } from '@xyflow/react'
import type { RelationType } from '@/entities/edge'
import type { ViewMode } from '../model/graph-view.store'

interface LayoutOptions {
  viewMode: ViewMode
  focusedNodeId?: string | null
  spacingPercent?: number
  directionStrength?: number
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

/**
 * Generate deterministic -1 or 1 based on string hash
 */
function hashToSide(str: string): number {
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

function createQuadNode(x: number, y: number, width: number, height: number): QuadNode {
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

function getQuadrant(node: QuadNode, px: number, py: number): number {
  const midX = node.x + node.width / 2
  const midY = node.y + node.height / 2
  const west = px < midX
  const north = py < midY
  if (north) return west ? 0 : 1 // NW : NE
  return west ? 2 : 3 // SW : SE
}

const MAX_QUADTREE_DEPTH = 20

function insertIntoQuadtree(node: QuadNode, px: number, py: number, depth = 0): void {
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

function insertIntoChild(node: QuadNode, px: number, py: number, depth: number): void {
  if (!node.children) return

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

function buildQuadtree(positions: { x: number; y: number }[]): QuadNode {
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

function calculateRepulsionBarnesHut(
  node: QuadNode,
  px: number,
  py: number,
  idealDistanceSq: number,
  theta: number
): { fx: number; fy: number } {
  let fx = 0
  let fy = 0

  if (node.mass === 0) return { fx: 0, fy: 0 }

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
}

export function applyLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
  const { viewMode, spacingPercent = 100, directionStrength = 100 } = options

  if (nodes.length === 0) return { nodes, edges }

  const spacingFactor = spacingPercent / 100
  const nodeSpacing = DEFAULT_NODE_SPACING * spacingFactor
  const levelSpacing = DEFAULT_LEVEL_SPACING * spacingFactor
  const normalizedDirection = directionStrength / 100

  const internalOptions: InternalLayoutOptions = {
    nodeSpacing,
    levelSpacing,
    directionStrength: normalizedDirection
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

function forceDirectedLayout(
  nodes: Node[],
  edges: Edge[],
  options: InternalLayoutOptions
): LayoutResult {
  const { nodeSpacing } = options
  const iterations = 150
  const idealDistance = nodeSpacing * 1.5
  const idealDistanceSq = idealDistance * idealDistance
  const coolingFactor = 0.97
  const theta = 0.9

  // FIX: Add Jitter to initialization
  // Even if we have a valid position, we add small noise to x.
  // This breaks vertical symmetries immediately upon re-layout.
  const positions = nodes.map((n, i) => {
    const hasValidPosition = n.position && (n.position.x !== 0 || n.position.y !== 0)
    return {
      id: n.id,
      x: hasValidPosition
        ? n.position.x + (Math.random() - 0.5) * 10 // Small jitter is crucial for updates
        : Math.cos(i * 2.4) * 200 + Math.random() * 50,
      y: hasValidPosition ? n.position.y : Math.sin(i * 2.4) * 200 + Math.random() * 50,
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
      if (!source || !target) return

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

      // Direction force
      if (options.directionStrength > 0) {
        const verticalForce = idealDistance * 1.2 * options.directionStrength * weight
        source.vy -= verticalForce
        target.vy += verticalForce

        // Horizontal spread when nodes are close vertically
        const yDiff = Math.abs(target.y - source.y)
        // FIX: Increased threshold and force
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
    // HORIZONTAL SPREAD (FIXED - Kimi K2 analysis)
    // ========================================
    if (options.directionStrength > 0) {
      // spreadStrength must be strong enough to counter vertical direction force
      // Was 0.08, increased to 0.3 (6x stronger)
      const spreadStrength = 0.3 * options.directionStrength
      positions.forEach(p => {
        const bias = hashToSide(p.id)
        // targetX is constant - removed * directionStrength to avoid instability
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

  const positionedNodes = nodes.map(node => {
    const pos = posMap.get(node.id)
    return {
      ...node,
      position: { x: pos?.x ?? 0, y: pos?.y ?? 0 }
    }
  })

  return { nodes: positionedNodes, edges }
}

function pathLayout(nodes: Node[], edges: Edge[], options: InternalLayoutOptions): LayoutResult {
  const { nodeSpacing, levelSpacing } = options

  const prereqEdges = edges.filter(e => (e.data?.relationType as RelationType) === 'prerequisite')

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

  const roots = nodes.filter(n => (incoming.get(n.id)?.length || 0) === 0)

  if (roots.length === 0) {
    return forceDirectedLayout(nodes, edges, options)
  }

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

  let maxLevel = 0
  levels.forEach(l => {
    if (l > maxLevel) maxLevel = l
  })
  nodes.forEach(n => {
    if (!levels.has(n.id)) {
      levels.set(n.id, maxLevel + 1)
    }
  })

  const levelGroups = new Map<number, string[]>()
  levels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) levelGroups.set(level, [])
    levelGroups.get(level)?.push(nodeId)
  })

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

export function getNodesWithinDepth(
  startNodeId: string,
  edges: Edge[],
  depth: number
): Set<string> {
  const connected = new Set<string>([startNodeId])
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

export function getEdgesBetweenNodes(edges: Edge[], nodeIds: Set<string>): Edge[] {
  return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
}
