import { describe, expect, it } from 'vitest'
import { FullMapSchema, MapEntitySchema } from '../map.schema'

describe('MapEntitySchema', () => {
  it('parses a minimal map entity', () => {
    const map = {
      id: 'map-1',
      title: 'Intro to Philosophy',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      nodesCount: 3,
      isPublic: false
    }

    expect(MapEntitySchema.parse(map)).toEqual(map)
  })
})

describe('FullMapSchema', () => {
  it('parses a full map with nodes and edges', () => {
    const node = {
      id: 'node-1',
      mapId: 'map-1',
      label: 'Existentialism',
      type: 'concept',
      position: { x: 0, y: 0 },
      metadata: {},
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    }

    const edge = {
      id: 'edge-1',
      mapId: 'map-1',
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      relationType: 'related-to',
      metadata: {},
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    }

    const map = {
      id: 'map-1',
      title: 'Intro to Philosophy',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      nodesCount: 1,
      edgesCount: 1,
      nodes: [node],
      edges: [edge]
    }

    const result = FullMapSchema.parse(map)
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(1)
  })
})
