import { describe, expect, it } from 'vitest'
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
})

describe('calculatePositionNearConnections', () => {
  it('returns null when no connections provided', () => {
    const result = calculatePositionNearConnections([], [])
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
})
