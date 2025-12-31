import { describe, expect, it } from 'vitest'
import {
  applyPositions,
  layoutOptionsToWasm,
  transformPositions,
  transformToWasm,
  viewportToWasm
} from '../lib/transform'

describe('transform helpers', () => {
  it('transforms nodes and edges to wasm JSON', () => {
    const nodes = [
      {
        id: 'node-1',
        mapId: 'map-1',
        label: 'Node 1',
        type: 'concept',
        position: { x: 1, y: 2 },
        metadata: { complexity: 'basic', tags: ['tag-1'] },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    const edges = [
      {
        id: 'edge-1',
        mapId: 'map-1',
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
        relationType: 'related-to',
        strength: 0.7,
        bidirectional: true,
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const json = transformToWasm(nodes, edges)
    const parsed = JSON.parse(json) as { nodes: Array<{ metadata?: Record<string, unknown> }> }
    expect(parsed.nodes[0].metadata).toEqual({ complexity: 'basic', tags: ['tag-1'] })
  })

  it('transforms positions into a map', () => {
    const map = transformPositions('[{\"id\":\"node-1\",\"x\":5,\"y\":7}]')
    expect(map.get('node-1')).toEqual({ x: 5, y: 7 })
  })

  it('applies positions to nodes', () => {
    const nodes = [
      {
        id: 'node-1',
        mapId: 'map-1',
        label: 'Node 1',
        type: 'concept',
        position: { x: 0, y: 0 },
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    const result = applyPositions(nodes, '[{\"id\":\"node-1\",\"x\":10,\"y\":20}]')
    expect(result[0].position).toEqual({ x: 10, y: 20 })
  })

  it('serializes viewport and layout options', () => {
    expect(
      viewportToWasm({ x: 1, y: 2, zoom: 1.2, width: 100, height: 200 })
    ).toContain('"zoom":1.2')

    const options = JSON.parse(
      layoutOptionsToWasm({ viewMode: 'focus', spacingPercent: 80, directionStrength: 50 })
    ) as { iterations: number; ignoreExistingPositions: boolean }

    expect(options.iterations).toBe(150)
    expect(options.ignoreExistingPositions).toBe(false)
  })
})
