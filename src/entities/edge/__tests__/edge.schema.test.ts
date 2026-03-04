import { describe, expect, it } from 'vitest'

import { EdgeSchema, RelationTypeEnum } from '../model/edge.schema'

describe('RelationTypeEnum', () => {
  it('accepts known relation types', () => {
    expect(RelationTypeEnum.parse('is-a')).toBe('is-a')
    expect(RelationTypeEnum.parse('related-to')).toBe('related-to')
  })

  it('rejects unknown relation types', () => {
    expect(() => RelationTypeEnum.parse('unknown')).toThrow()
  })
})

describe('EdgeSchema', () => {
  it('applies defaults for metadata and strength', () => {
    const edge = {
      id: 'edge-1',
      mapId: 'map-1',
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      relationType: 'is-a',
      metadata: {},
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    }

    const result = EdgeSchema.parse(edge)
    expect(result.metadata.confidence).toBe(0.5)
    expect(result.metadata.createdBy).toBe('user')
    expect(result.strength).toBe(0.5)
  })
})
