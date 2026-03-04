import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useConnectionFilter } from '../model/edge.hooks'

const edges = [
  {
    id: 'edge-1',
    mapId: 'map-1',
    sourceNodeId: 'node-a',
    targetNodeId: 'node-b',
    relationType: 'related-to',
    strength: 0.5,
    bidirectional: false,
    metadata: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'edge-2',
    mapId: 'map-1',
    sourceNodeId: 'node-b',
    targetNodeId: 'node-a',
    relationType: 'is-a',
    strength: 0.5,
    bidirectional: false,
    metadata: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

describe('useConnectionFilter', () => {
  it('returns counts and all edges by default', () => {
    const { result } = renderHook(() => useConnectionFilter('node-a', edges))
    expect(result.current.filter).toBe('all')
    expect(result.current.incomingCount).toBe(1)
    expect(result.current.outgoingCount).toBe(1)
    expect(result.current.totalCount).toBe(2)
    expect(result.current.filteredEdges).toHaveLength(2)
  })

  it('filters incoming edges', () => {
    const { result } = renderHook(() => useConnectionFilter('node-a', edges))
    act(() => {
      result.current.changeFilter('incoming')
    })
    expect(result.current.filteredEdges).toHaveLength(1)
    expect(result.current.filteredEdges[0].sourceNodeId).toBe('node-b')
  })

  it('filters outgoing edges', () => {
    const { result } = renderHook(() => useConnectionFilter('node-a', edges))
    act(() => {
      result.current.changeFilter('outgoing')
    })
    expect(result.current.filteredEdges).toHaveLength(1)
    expect(result.current.filteredEdges[0].targetNodeId).toBe('node-b')
  })
})
