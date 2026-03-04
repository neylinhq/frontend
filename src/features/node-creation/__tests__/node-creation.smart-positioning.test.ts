import { describe, expect, it, vi } from 'vitest'

import { calculatePositionNearConnections, calculateSmartPosition } from '../lib/smart-positioning'

describe('calculateSmartPosition', () => {
  it('returns center when there are no nodes', () => {
    const result = calculateSmartPosition({
      center: { x: 100, y: 100 },
      existingNodes: []
    })

    expect(result).toEqual({ x: 100, y: 100 })
  })

  it('finds a clear position near the center', () => {
    const result = calculateSmartPosition({
      center: { x: 0, y: 0 },
      existingNodes: [
        {
          id: 'node-1',
          position: { x: 1000, y: 1000 }
        }
      ],
      minDistance: 50,
      maxAttempts: 3
    })

    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('falls back to nearest position when spiral search fails', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = calculateSmartPosition({
      center: { x: 0, y: 0 },
      existingNodes: [
        {
          id: 'node-1',
          position: { x: 0, y: 0 },
          measured: { width: 50, height: 50 }
        }
      ],
      minDistance: 3000,
      maxAttempts: 1
    })

    expect(result).toEqual({ x: 0, y: 0 })
    randomSpy.mockRestore()
  })

  it('searches nearest clear position when spiral candidates are blocked', () => {
    const result = calculateSmartPosition({
      center: { x: 0, y: 0 },
      existingNodes: [
        {
          id: 'node-1',
          position: { x: 0, y: 0 },
          measured: { width: 0, height: 0 }
        }
      ],
      minDistance: 100,
      maxAttempts: 1
    })

    expect(Math.round(result.x)).toBe(100)
    expect(Math.round(result.y)).toBe(0)
  })

  it('expands search radius when initial ring is blocked', () => {
    const minDistance = 100
    const angleStep = Math.PI / 8
    const existingNodes = [
      { id: 'center', position: { x: 0, y: 0 }, measured: { width: 0, height: 0 } }
    ]

    for (let i = 0; i < 16; i++) {
      const angle = i * angleStep
      existingNodes.push({
        id: `node-${i}`,
        position: { x: Math.cos(angle) * minDistance, y: Math.sin(angle) * minDistance },
        measured: { width: 0, height: 0 }
      })
    }

    const result = calculateSmartPosition({
      center: { x: 0, y: 0 },
      existingNodes,
      minDistance,
      maxAttempts: 1,
      nodeWidth: 0,
      nodeHeight: 0
    })

    expect(Math.round(result.x)).toBe(200)
    expect(Math.round(result.y)).toBe(0)
  })
})

describe('calculatePositionNearConnections', () => {
  it('returns null when no connections provided', () => {
    const result = calculatePositionNearConnections([], [])
    expect(result).toBeNull()
  })

  it('returns null when connected nodes are missing', () => {
    const existingNodes = [{ id: 'node-a', position: { x: 0, y: 0 } }]
    const result = calculatePositionNearConnections(['node-x'], existingNodes, 100)
    expect(result).toBeNull()
  })

  it('returns a position near connected nodes', () => {
    const existingNodes = [
      { id: 'node-a', position: { x: 0, y: 0 } },
      { id: 'node-b', position: { x: 200, y: 0 } },
      { id: 'node-c', position: { x: 100, y: 200 } }
    ]

    const result = calculatePositionNearConnections(['node-a', 'node-b'], existingNodes, 100)
    expect(result).not.toBeNull()
    expect(result?.x).toBeDefined()
    expect(result?.y).toBeDefined()
  })

  it('handles zero distance between connected and graph centers', () => {
    const existingNodes = [
      { id: 'node-a', position: { x: 0, y: 0 } },
      { id: 'node-b', position: { x: 10, y: 0 } }
    ]

    const result = calculatePositionNearConnections(['node-a', 'node-b'], existingNodes, 100)
    expect(result).not.toBeNull()
  })
})
