import { describe, expect, it, vi } from 'vitest'
import { transformEdgesToFlow, transformNodesToFlow } from '../lib/transform-data'

const baseNode = {
  id: 'node-1',
  mapId: 'map-1',
  label: 'Node 1',
  type: 'concept',
  position: { x: 10, y: 20 },
  metadata: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const baseEdge = {
  id: 'edge-1',
  mapId: 'map-1',
  sourceNodeId: 'node-1',
  targetNodeId: 'node-2',
  relationType: 'related-to',
  strength: 0.5,
  bidirectional: false,
  metadata: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

describe('transformNodesToFlow', () => {
  it('maps nodes to React Flow format', () => {
    const onSelect = vi.fn()
    const result = transformNodesToFlow([baseNode], {
      selectedNodeIds: ['node-1'],
      onSelect,
      focusedNodeId: 'node-1',
      animated: true,
      zoom: 0.8
    })

    expect(result[0].type).toBe('knowledgeNode')
    expect(result[0].data.selected).toBe(true)
    expect(result[0].data.isFocused).toBe(true)
    expect(result[0].data.onSelect).toBe(onSelect)
    expect(result[0].style?.transition).toContain('transform')
  })
})

describe('transformEdgesToFlow', () => {
  it('maps edges to React Flow format', () => {
    const onStartEditing = vi.fn()
    const result = transformEdgesToFlow([baseEdge], {
      selectedEdgeIds: new Set(['edge-1']),
      zoom: 1,
      translations: { 'related-to': 'Related' } as Record<string, string>,
      onStartEditing
    })

    expect(result[0].source).toBe('node-1')
    expect(result[0].target).toBe('node-2')
    expect(result[0].data.selected).toBe(true)
    expect(result[0].data.translatedType).toBe('Related')
    expect(result[0].data.onStartEditing).toBe(onStartEditing)
  })
})
