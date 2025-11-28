import { z } from 'zod'
import { type Edge, EdgeSchema, type RelationType, RelationTypeEnum } from '../edge'
import { type Node, NodeSchema } from '../node'

export const MapEntitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
  nodesCount: z.number(),
  previewUrl: z.string().optional()
})

export type MapEntity = z.infer<typeof MapEntitySchema>

// Re-export for backward compatibility
export type { Node, Edge, RelationType }
export { NodeSchema, EdgeSchema, RelationTypeEnum }

// Полная карта знаний с узлами и связями
export const FullMapSchema = MapEntitySchema.extend({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  aiAnalysis: z
    .object({
      lastAnalyzed: z.string().optional(),
      gaps: z.array(z.string()).optional(), // Выявленные пробелы
      suggestions: z.array(z.string()).optional(), // Предложения по развитию
      complexityScore: z.number().optional(), // Сложность 0-1
      completenessScore: z.number().optional(), // Полнота 0-1
      structuralIssues: z.array(z.string()).optional()
    })
    .optional()
})

export type FullMap = z.infer<typeof FullMapSchema>
