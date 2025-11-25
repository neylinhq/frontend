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

// Метаданные узла
export const NodeMetadataSchema = z
  .object({
    confidence: z.number().min(0).max(1).optional(), // Уверенность в знании 0-1
    complexity: z.enum(['basic', 'intermediate', 'advanced']).optional(),
    sources: z.array(z.string()).optional(), // Источники информации
    tags: z.array(z.string()).optional(),
    lastReviewed: z.string().optional(),
    reviewCount: z.number().optional()
  })
  .default({ reviewCount: 0 })

export type NodeMetadata = z.infer<typeof NodeMetadataSchema>

// Схема для узла карты знаний
export const NodeSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  label: z.string(),
  description: z.string().optional(),
  type: NodeTypeEnum,
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  metadata: NodeMetadataSchema,
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Node = z.infer<typeof NodeSchema>
