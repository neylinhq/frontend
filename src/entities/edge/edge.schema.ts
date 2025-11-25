import { z } from 'zod'

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

// Метаданные связи
export const EdgeMetadataSchema = z
  .object({
    confidence: z.number().min(0).max(1).default(0.5),
    evidence: z.array(z.string()).optional(), // Источники подтверждения
    examples: z.array(z.string()).optional(), // Примеры применения
    createdBy: z.enum(['user', 'ai', 'both']).default('user'),
    lastValidated: z.string().optional()
  })
  .default({})

export type EdgeMetadata = z.infer<typeof EdgeMetadataSchema>

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
  metadata: EdgeMetadataSchema,
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Edge = z.infer<typeof EdgeSchema>
