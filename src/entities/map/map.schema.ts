import { z } from 'zod'

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

// Типы связей между концептами
export const RelationTypeEnum = z.enum([
  'is-a', // наследование (Собака is-a Млекопитающее)
  'has-a', // состав (Автомобиль has-a Двигатель)
  'causes', // причинность (Курение causes Рак)
  'explains', // объяснение (Квантовая механика explains Поведение атомов)
  'related-to', // общая связь (Франция related-to Германия)
  'influences', // влияние (Социальные сети influences Общественное мнение)
  'part-of', // часть целого (Колесо part-of Автомобиль)
  'prerequisite', // предпосылка (Алгебра prerequisite Исчисление)
  'contradicts', // противоречие (Свобода воли contradicts Детерминизм)
  'similar-to' // сходство (Кот similar-to Тигр)
])

export type RelationType = z.infer<typeof RelationTypeEnum>

// Схема для узла карты знаний
export const NodeSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  label: z.string(),
  description: z.string().optional(),
  type: z.enum(['concept', 'fact', 'theory', 'example', 'question', 'hypothesis']),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  metadata: z
    .object({
      confidence: z.number().min(0).max(1).optional(), // Уверенность в знании 0-1
      complexity: z.enum(['basic', 'intermediate', 'advanced']).optional(),
      sources: z.array(z.string()).optional(), // Источники информации
      tags: z.array(z.string()).optional(),
      lastReviewed: z.string().optional(),
      reviewCount: z.number().default(0)
    })
    .default({}),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Node = z.infer<typeof NodeSchema>

// Схема для связи между узлами
export const EdgeSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  relationType: RelationTypeEnum,
  label: z.string().optional(), // Текстовое описание связи
  strength: z.number().min(0).max(1).default(0.5), // Сила связи 0-1
  bidirectional: z.boolean().default(false),
  metadata: z
    .object({
      confidence: z.number().min(0).max(1).default(0.5),
      evidence: z.array(z.string()).optional(), // Источники подтверждения
      examples: z.array(z.string()).optional(), // Примеры применения
      createdBy: z.enum(['user', 'ai', 'both']).default('user'),
      lastValidated: z.string().optional()
    })
    .default({}),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Edge = z.infer<typeof EdgeSchema>

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
