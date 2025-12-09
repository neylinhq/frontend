import { z } from 'zod'

// Типы узлов карты знаний
export const NodeTypeEnum = z.enum([
  'concept',
  'fact',
  'theory',
  'example',
  'question',
  'hypothesis',
  'person',
  'school'
])

export type NodeType = z.infer<typeof NodeTypeEnum>

// Метаданные узла (объективные данные контента)
// Персональные данные (confidence, reviewCount) вынесены в user_node_progress
export const NodeMetadataSchema = z
  .object({
    complexity: z.enum(['basic', 'intermediate', 'advanced']).optional(),
    sources: z.array(z.string()).optional(), // Источники информации
    tags: z.array(z.string()).optional()
  })
  .default({})

export type NodeMetadata = z.infer<typeof NodeMetadataSchema>

// Схема для узла карты знаний
export const NodeSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  label: z.string(),
  description: z.string().optional(), // Plain text summary (150-200 chars) for graph/search
  content: z.string().optional(), // HTML from rich text editor
  type: NodeTypeEnum,
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  metadata: NodeMetadataSchema,
  aiGenerated: z.boolean().optional(), // Whether node was AI-generated
  lastEnrichedAt: z.string().nullable().optional(), // Last AI enrichment timestamp
  factCheckStatus: z.enum(['verified', 'unverified', 'disputed', 'false']).nullable().optional(),
  factCheckResult: z.unknown().optional(), // Detailed fact-check results
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Node = z.infer<typeof NodeSchema>

// Lightweight variant for graph views (excludes content field)
export const LightweightNodeSchema = NodeSchema.omit({ content: true })
export type LightweightNode = z.infer<typeof LightweightNodeSchema>

// Request types for node operations
export type CreateNodeRequest = Omit<Node, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateNodeRequest = Partial<Omit<Node, 'id' | 'mapId' | 'createdAt' | 'updatedAt'>>
export type UpdatePositionsRequest = {
  positions: Array<{ id: string; x: number; y: number }>
}
