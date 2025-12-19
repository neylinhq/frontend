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
  edgesCount: z.number().optional(),
  previewUrl: z.string().optional(),
  isPublic: z.boolean().default(false),
  authorId: z.string().optional(),
  authorName: z.string().optional()
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

// Discover endpoint response
export const MapDiscoverResponseSchema = z.object({
  maps: z.array(MapEntitySchema),
  totalCount: z.number(),
  ownedCount: z.number(),
  publicCount: z.number()
})

export type MapDiscoverResponse = z.infer<typeof MapDiscoverResponseSchema>

// Search matched node
export const MatchedNodeSchema = z.object({
  id: z.string(),
  label: z.string()
})

export type MatchedNode = z.infer<typeof MatchedNodeSchema>

// Search item with matched nodes
export const MapSearchItemSchema = MapEntitySchema.extend({
  matchedNodes: z.array(MatchedNodeSchema).optional()
})

export type MapSearchItem = z.infer<typeof MapSearchItemSchema>

// Search endpoint response
export const MapSearchResponseSchema = z.object({
  maps: z.array(MapSearchItemSchema),
  totalCount: z.number(),
  query: z.string(),
  searchedIn: z.string() // "maps" | "nodes" | "all"
})

export type MapSearchResponse = z.infer<typeof MapSearchResponseSchema>

// Filter types
export type MapFilter = 'all' | 'owned' | 'public'
export type MapSearchMode = 'maps' | 'nodes' | 'all'

// Map History types
export const MapEventTypeEnum = z.enum([
  'node_created',
  'node_updated',
  'node_deleted',
  'edge_created',
  'edge_updated',
  'edge_deleted',
  'map_updated',
  'ai_proposal_applied'
])

export type MapEventType = z.infer<typeof MapEventTypeEnum>

export const EntityTypeEnum = z.enum(['node', 'edge', 'map'])
export type EntityType = z.infer<typeof EntityTypeEnum>

export const EventSourceEnum = z.enum(['user', 'ai', 'import', 'system'])
export type EventSource = z.infer<typeof EventSourceEnum>

export const MapEventSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  userId: z.string(),
  eventType: MapEventTypeEnum,
  entityType: EntityTypeEnum,
  entityId: z.string().nullable(),
  changes: z.object({
    before: z.unknown().optional(),
    after: z.unknown().optional(),
    data: z.unknown().optional()
  }),
  source: EventSourceEnum,
  version: z.number(),
  createdAt: z.string()
})

export type MapEvent = z.infer<typeof MapEventSchema>

export const MapHistoryResponseSchema = z.object({
  events: z.array(MapEventSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number()
})

export type MapHistoryResponse = z.infer<typeof MapHistoryResponseSchema>

export const MapHistorySummarySchema = z.object({
  mapId: z.string(),
  totalEvents: z.number(),
  nodeCreated: z.number(),
  nodeUpdated: z.number(),
  nodeDeleted: z.number(),
  edgeCreated: z.number(),
  edgeDeleted: z.number(),
  lastEventAt: z.string().nullable()
})

export type MapHistorySummary = z.infer<typeof MapHistorySummarySchema>
