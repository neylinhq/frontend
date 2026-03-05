import { describe, expect, it, vi } from 'vitest'

import {
  getEdgesBetweenNodes,
  getNodesWithinDepth,
  pathLayout
} from '../lib/layout-algorithms-common'

describe('layout-algorithms-common', () => {
  it('falls back when no prerequisite roots', () => {
    const nodes = [
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 0, y: 0 } }
    ]
    const edges = [
      { id: 'e1', source: 'a', target: 'b', data: { relationType: 'prerequisite' } },
      { id: 'e2', source: 'b', target: 'a', data: { relationType: 'prerequisite' } }
    ]
    const fallback = vi.fn(() => ({ nodes, edges }))

    pathLayout(
      nodes,
      edges,
      { nodeSpacing: 100, levelSpacing: 200, directionStrength: 1 },
      fallback
    )
    expect(fallback).toHaveBeenCalled()
  })

  it('positions nodes along prerequisite path', () => {
    const nodes = [
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 0, y: 0 } }
    ]
    const edges = [{ id: 'e1', source: 'a', target: 'b', data: { relationType: 'prerequisite' } }]

    const result = pathLayout(
      nodes,
      edges,
      { nodeSpacing: 100, levelSpacing: 200, directionStrength: 1 },
      () => ({ nodes, edges })
    )

    const nodeA = result.nodes.find(node => node.id === 'a')
    const nodeB = result.nodes.find(node => node.id === 'b')
    expect(nodeA?.position.x).toBe(0)
    expect(nodeB?.position.x).toBe(200)
  })

  it('positions disconnected chains and skips duplicate visits', () => {
    const nodes = [
      { id: '', position: { x: 0, y: 0 } },
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 0, y: 0 } },
      { id: 'c', position: { x: 0, y: 0 } },
      { id: 'x', position: { x: 0, y: 0 } },
      { id: 'y', position: { x: 0, y: 0 } }
    ]
    const edges = [
      { id: 'e1', source: 'a', target: 'b', data: { relationType: 'prerequisite' } },
      { id: 'e2', source: 'a', target: 'c', data: { relationType: 'prerequisite' } },
      { id: 'e3', source: 'b', target: 'c', data: { relationType: 'prerequisite' } },
      { id: 'e4', source: 'x', target: 'y', data: { relationType: 'prerequisite' } },
      { id: 'e5', source: 'y', target: 'x', data: { relationType: 'prerequisite' } }
    ]

    const result = pathLayout(
      nodes,
      edges,
      { nodeSpacing: 100, levelSpacing: 200, directionStrength: 1 },
      () => ({ nodes, edges })
    )

    const orphan = result.nodes.find(node => node.id === 'x')
    expect(orphan?.position.x).toBe(400)
  })

  it('returns nodes within depth', () => {
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' }
    ]
    const connected = getNodesWithinDepth('a', edges, 1)
    expect(Array.from(connected)).toEqual(['a', 'b'])
  })

  it('handles cycles and repeated neighbors within depth', () => {
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'a' },
      { id: 'e3', source: 'a', target: 'b' }
    ]
    const connected = getNodesWithinDepth('a', edges, 2)
    expect(Array.from(connected).sort()).toEqual(['a', 'b'])
  })

  it('filters edges between node sets', () => {
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' }
    ]
    const result = getEdgesBetweenNodes(edges, new Set(['a', 'b']))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e1')
  })
})
