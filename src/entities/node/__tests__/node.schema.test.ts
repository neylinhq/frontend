import { describe, expect, it } from 'vitest'
import {
  LightweightNodeSchema,
  NodeMetadataSchema,
  NodeSchema,
  NodeTypeEnum
} from '../node.schema'

describe('Node Schemas', () => {
  describe('NodeTypeSchema', () => {
    it('should validate valid node types', () => {
      const validTypes = [
        'concept',
        'fact',
        'theory',
        'example',
        'question',
        'hypothesis',
        'person',
        'school'
      ]

      for (const type of validTypes) {
        expect(NodeTypeEnum.parse(type)).toBe(type)
      }
    })

    it('should reject invalid node types', () => {
      expect(() => NodeTypeEnum.parse('invalid')).toThrow()
      expect(() => NodeTypeEnum.parse('')).toThrow()
      expect(() => NodeTypeEnum.parse(123)).toThrow()
    })
  })

  describe('NodeMetadataSchema', () => {
    it('should validate valid metadata', () => {
      const validMetadata = {
        sources: ['https://example.com'],
        tags: ['philosophy', 'modern']
      }

      const result = NodeMetadataSchema.parse(validMetadata)
      expect(result).toEqual(validMetadata)
    })

    it('should allow empty metadata', () => {
      const result = NodeMetadataSchema.parse({})
      expect(result).toEqual({})
    })

    it('should reject invalid metadata values', () => {
      expect(() => NodeMetadataSchema.parse({ sources: [123] })).toThrow()
      expect(() => NodeMetadataSchema.parse({ tags: ['valid', 42] })).toThrow()
    })
  })

  describe('NodeSchema', () => {
    it('should validate a complete node', () => {
      const validNode = {
        id: 'test-id-123',
        mapId: 'map-id-456',
        label: 'Existentialism',
        description: 'Philosophy emphasizing individual existence',
        content: '<p>Full content here</p>',
        type: 'theory' as const,
        position: { x: 100, y: 200 },
        metadata: {
          tags: ['philosophy']
        },
        complexity: 9200,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      }

      const result = NodeSchema.parse(validNode)
      expect(result).toEqual(validNode)
    })

    it('should validate a minimal node', () => {
      const minimalNode = {
        id: 'test-id-123',
        mapId: 'map-id-456',
        label: 'Test Node',
        type: 'concept' as const,
        position: { x: 0, y: 0 },
        metadata: {},
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      }

      const result = NodeSchema.parse(minimalNode)
      expect(result).toEqual(minimalNode)
    })

    it('should reject node without required fields', () => {
      expect(() => NodeSchema.parse({})).toThrow()
      expect(() =>
        NodeSchema.parse({
          id: 'test-id',
          // missing mapId
          label: 'Test',
          type: 'concept'
        })
      ).toThrow()
    })
  })

  describe('LightweightNodeSchema', () => {
    it('should validate lightweight node without content', () => {
      const lightweightNode = {
        id: 'test-id-123',
        mapId: 'map-id-456',
        label: 'Test Node',
        description: 'Short description',
        type: 'concept' as const,
        position: { x: 100, y: 100 },
        metadata: {},
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      }

      const result = LightweightNodeSchema.parse(lightweightNode)
      expect(result).toEqual(lightweightNode)
    })

    it('should reject node with content field', () => {
      const nodeWithContent = {
        id: 'test-id-123',
        mapId: 'map-id-456',
        label: 'Test Node',
        content: '<p>This should not be here</p>',
        type: 'concept' as const,
        position: { x: 0, y: 0 },
        metadata: {},
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      }

      // LightweightNode omits content, so it should still parse
      // but content field will be stripped
      const result = LightweightNodeSchema.parse(nodeWithContent)
      expect(result).not.toHaveProperty('content')
    })
  })
})
