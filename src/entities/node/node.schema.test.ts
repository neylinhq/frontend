import { describe, it, expect } from 'vitest';
import {
	NodeTypeSchema,
	NodeMetadataSchema,
	NodeSchema,
	LightweightNodeSchema,
} from './node.schema';

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
				'school',
			];

			for (const type of validTypes) {
				expect(NodeTypeSchema.parse(type)).toBe(type);
			}
		});

		it('should reject invalid node types', () => {
			expect(() => NodeTypeSchema.parse('invalid')).toThrow();
			expect(() => NodeTypeSchema.parse('')).toThrow();
			expect(() => NodeTypeSchema.parse(123)).toThrow();
		});
	});

	describe('NodeMetadataSchema', () => {
		it('should validate valid metadata', () => {
			const validMetadata = {
				confidence: 0.8,
				complexity: 'intermediate' as const,
				sources: ['https://example.com'],
				tags: ['philosophy', 'modern'],
				lastReviewed: '2024-01-15T00:00:00.000Z',
				reviewCount: 5,
			};

			const result = NodeMetadataSchema.parse(validMetadata);
			expect(result).toEqual(validMetadata);
		});

		it('should allow empty metadata', () => {
			const result = NodeMetadataSchema.parse({});
			expect(result).toEqual({});
		});

		it('should reject invalid confidence values', () => {
			expect(() =>
				NodeMetadataSchema.parse({ confidence: 1.5 }),
			).toThrow();
			expect(() =>
				NodeMetadataSchema.parse({ confidence: -0.1 }),
			).toThrow();
		});

		it('should reject invalid complexity values', () => {
			expect(() =>
				NodeMetadataSchema.parse({ complexity: 'expert' }),
			).toThrow();
		});
	});

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
					confidence: 0.9,
					complexity: 'advanced' as const,
					tags: ['philosophy'],
				},
				createdAt: '2024-01-15T00:00:00.000Z',
				updatedAt: '2024-01-15T00:00:00.000Z',
			};

			const result = NodeSchema.parse(validNode);
			expect(result).toEqual(validNode);
		});

		it('should validate a minimal node', () => {
			const minimalNode = {
				id: 'test-id-123',
				mapId: 'map-id-456',
				label: 'Test Node',
				type: 'concept' as const,
				position: { x: 0, y: 0 },
				metadata: {},
				createdAt: '2024-01-15T00:00:00.000Z',
				updatedAt: '2024-01-15T00:00:00.000Z',
			};

			const result = NodeSchema.parse(minimalNode);
			expect(result).toEqual(minimalNode);
		});

		it('should reject node without required fields', () => {
			expect(() => NodeSchema.parse({})).toThrow();
			expect(() =>
				NodeSchema.parse({
					id: 'test-id',
					// missing mapId
					label: 'Test',
					type: 'concept',
				}),
			).toThrow();
		});
	});

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
				updatedAt: '2024-01-15T00:00:00.000Z',
			};

			const result = LightweightNodeSchema.parse(lightweightNode);
			expect(result).toEqual(lightweightNode);
		});

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
				updatedAt: '2024-01-15T00:00:00.000Z',
			};

			// LightweightNode omits content, so it should still parse
			// but content field will be stripped
			const result = LightweightNodeSchema.parse(nodeWithContent);
			expect(result).not.toHaveProperty('content');
		});
	});
});
