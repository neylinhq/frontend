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
        description: 'Node description',
        metadata: { complexity: 'basic', tags: ['tag-1'], sources: ['source-1'] },
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
        label: 'Edge label',
        strength: 0.7,
        bidirectional: true,
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const json = transformToWasm(nodes, edges)
    const parsed = JSON.parse(json) as {
      nodes: Array<{ description?: string; metadata?: Record<string, unknown> }>
      edges: Array<{ label?: string }>
    }
    expect(parsed.nodes[0].description).toBe('Node description')
    expect(parsed.nodes[0].metadata).toEqual({
      complexity: 'basic',
      tags: ['tag-1'],
      sources: ['source-1']
    })
    expect(parsed.edges[0].label).toBe('Edge label')
  })

  it('omits empty metadata and uses defaults', () => {
    const nodes = [
      {
        id: 'node-1',
        mapId: 'map-1',
        label: 'Node 1',
        type: 'concept',
        metadata: { complexity: 'invalid' },
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
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const parsed = JSON.parse(transformToWasm(nodes, edges)) as {
      nodes: Array<{ metadata?: Record<string, unknown>; position: { x: number; y: number } }>
      edges: Array<{ relationType: string }>
    }

    expect(parsed.nodes[0].metadata).toBeUndefined()
    expect(parsed.nodes[0].position).toEqual({ x: 0, y: 0 })
    expect(parsed.edges[0].relationType).toBe('related-to')
  })

  it('handles missing metadata gracefully', () => {
    const nodes = [
      {
        id: 'node-1',
        mapId: 'map-1',
        label: 'Node 1',
        type: 'concept',
        position: { x: 1, y: 2 },
        metadata: undefined as unknown as Record<string, unknown>,
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
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const parsed = JSON.parse(transformToWasm(nodes, edges)) as {
      nodes: Array<{ metadata?: Record<string, unknown> }>
    }
    expect(parsed.nodes[0].metadata).toBeUndefined()
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

  it('keeps nodes unchanged when no positions exist', () => {
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

    const result = applyPositions(nodes, '[]')
    expect(result[0].position).toEqual({ x: 0, y: 0 })
  })

  it('serializes viewport and layout options', () => {
    expect(
      viewportToWasm({ x: 1, y: 2, zoom: 1.2, width: 100, height: 200 })
    ).toContain('"zoom":1.2')

    const options = JSON.parse(
      layoutOptionsToWasm({
        viewMode: 'focus',
        spacingPercent: 80,
        directionStrength: 50,
        iterations: 200,
        coolingFactor: 0.5,
        theta: 0.5,
        ignoreExistingPositions: true,
        focusedNodeId: 'node-1'
      })
    ) as {
      iterations: number
      coolingFactor: number
      theta: number
      ignoreExistingPositions: boolean
      focusedNodeId: string
    }

    expect(options.iterations).toBe(200)
    expect(options.coolingFactor).toBe(0.5)
    expect(options.theta).toBe(0.5)
    expect(options.ignoreExistingPositions).toBe(true)
    expect(options.focusedNodeId).toBe('node-1')
  })

  it('uses layout option defaults when omitted', () => {
    const options = JSON.parse(
      layoutOptionsToWasm({
        viewMode: 'overview',
        spacingPercent: 100,
        directionStrength: 50
      })
    ) as {
      iterations: number
      coolingFactor: number
      theta: number
      ignoreExistingPositions: boolean
    }

    expect(options.iterations).toBe(150)
    expect(options.coolingFactor).toBe(0.97)
    expect(options.theta).toBe(0.9)
    expect(options.ignoreExistingPositions).toBe(false)
  })
})
