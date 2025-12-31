import { describe, expect, it, vi } from 'vitest'
import { applyLayout, getEdgesBetweenNodes, getNodesWithinDepth } from '../lib/layout-algorithms-optimized'

describe('layout-algorithms-optimized', () => {
  it('returns empty layout when no nodes', () => {
    const result = applyLayout([], [], { viewMode: 'focus' })
    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it('applies focus layout to nodes', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const nodes = [
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 0, y: 0 } }
    ]
    const edges = [
      { id: 'e1', source: 'a', target: 'b', data: { relationType: 'related-to' } }
    ]

    const result = applyLayout(nodes, edges, {
      viewMode: 'focus',
      spacingPercent: 50,
      directionStrength: 0,
      ignoreExistingPositions: true
    })

    expect(result.nodes).toHaveLength(2)
    expect(typeof result.nodes[0].position.x).toBe('number')
    expect(typeof result.nodes[0].position.y).toBe('number')

    vi.restoreAllMocks()
  })

  it('applies path layout to nodes', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const nodes = [
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 0, y: 0 } }
    ]
    const edges = [
      { id: 'e1', source: 'a', target: 'b', data: { relationType: 'prerequisite' } }
    ]

    const result = applyLayout(nodes, edges, {
      viewMode: 'path',
      spacingPercent: 100,
      directionStrength: 100,
      ignoreExistingPositions: true
    })

    expect(result.nodes).toHaveLength(2)
    vi.restoreAllMocks()
  })

  it('returns nodes within depth and edges between nodes', () => {
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' }
    ]

    const connected = getNodesWithinDepth('a', edges, 1)
    expect(Array.from(connected)).toEqual(['a', 'b'])

    const filtered = getEdgesBetweenNodes(edges, new Set(['a', 'b']))
    expect(filtered).toHaveLength(1)
  })
})
