import type { Node as FlowNode } from '@xyflow/react'

interface Position {
  x: number
  y: number
}

interface SmartPositionOptions {
  center: Position
  existingNodes: FlowNode[]
  nodeWidth?: number
  nodeHeight?: number
  minDistance?: number
  maxAttempts?: number
}

const DEFAULT_NODE_WIDTH = 220
const DEFAULT_NODE_HEIGHT = 80
const DEFAULT_MIN_DISTANCE = 280
const DEFAULT_MAX_ATTEMPTS = 50

/**
 * Generates spiral offsets using Archimedean spiral pattern
 */
const generateSpiralOffsets = (count: number, baseDistance: number): Position[] => {
  const offsets: Position[] = [{ x: 0, y: 0 }]

  for (let i = 1; i < count; i++) {
    const angle = i * 0.6
    const radius = baseDistance * (0.5 + i * 0.12)
    offsets.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    })
  }

  return offsets
}

/**
 * Checks if a candidate position is clear of existing nodes
 */
const isPositionClear = (
  candidate: Position,
  occupiedPositions: Position[],
  minDistance: number
): boolean => {
  return occupiedPositions.every(pos => {
    const dx = candidate.x - pos.x
    const dy = candidate.y - pos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance >= minDistance
  })
}

/**
 * Finds the nearest clear position using expanding circles
 */
const findNearestClearPosition = (
  center: Position,
  occupied: Position[],
  minDistance: number
): Position => {
  let radius = minDistance
  const angleStep = Math.PI / 8

  while (radius < 2000) {
    for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
      const candidate = {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      }

      if (isPositionClear(candidate, occupied, minDistance)) {
        return candidate
      }
    }
    radius += minDistance * 0.5
  }

  // Fallback: random offset
  return {
    x: center.x + (Math.random() - 0.5) * 500,
    y: center.y + (Math.random() - 0.5) * 500
  }
}

/**
 * Calculates a smart position for a new node, avoiding overlap with existing nodes
 */
export const calculateSmartPosition = ({
  center,
  existingNodes,
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT,
  minDistance = DEFAULT_MIN_DISTANCE,
  maxAttempts = DEFAULT_MAX_ATTEMPTS
}: SmartPositionOptions): Position => {
  if (existingNodes.length === 0) {
    return center
  }

  // Collect center positions of existing nodes
  const occupiedPositions = existingNodes.map(node => ({
    x: node.position.x + (node.measured?.width ?? nodeWidth) / 2,
    y: node.position.y + (node.measured?.height ?? nodeHeight) / 2
  }))

  // Strategy 1: Spiral search from center
  const spiralOffsets = generateSpiralOffsets(maxAttempts, minDistance)

  for (const offset of spiralOffsets) {
    const candidate = {
      x: center.x + offset.x,
      y: center.y + offset.y
    }

    if (isPositionClear(candidate, occupiedPositions, minDistance)) {
      return candidate
    }
  }

  // Strategy 2: Find nearest clear position
  return findNearestClearPosition(center, occupiedPositions, minDistance)
}

/**
 * Calculates position near connected nodes (for when creating node with edges)
 */
export const calculatePositionNearConnections = (
  connectedNodeIds: string[],
  existingNodes: FlowNode[],
  minDistance: number = DEFAULT_MIN_DISTANCE
): Position | null => {
  if (connectedNodeIds.length === 0) return null

  const connectedNodes = existingNodes.filter(n => connectedNodeIds.includes(n.id))
  if (connectedNodes.length === 0) return null

  // Calculate center of mass of connected nodes
  const centerOfConnected = {
    x: connectedNodes.reduce((sum, n) => sum + n.position.x, 0) / connectedNodes.length,
    y: connectedNodes.reduce((sum, n) => sum + n.position.y, 0) / connectedNodes.length
  }

  // Calculate direction away from graph center
  const graphCenter = {
    x: existingNodes.reduce((sum, n) => sum + n.position.x, 0) / existingNodes.length,
    y: existingNodes.reduce((sum, n) => sum + n.position.y, 0) / existingNodes.length
  }

  const dx = centerOfConnected.x - graphCenter.x
  const dy = centerOfConnected.y - graphCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1

  // Place new node in direction away from graph center
  const targetCenter = {
    x: centerOfConnected.x + (dx / dist) * minDistance * 0.7,
    y: centerOfConnected.y + (dy / dist) * minDistance * 0.7
  }

  return calculateSmartPosition({
    center: targetCenter,
    existingNodes,
    minDistance
  })
}
