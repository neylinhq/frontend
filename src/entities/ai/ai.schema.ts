import { z } from 'zod'

export const AITaskSchema = z.object({
  id: z.string(),
  type: z.enum([
    'node_enrichment',
    'map_analysis',
    'exercise_gen',
    'fact_check',
    'gap_detection',
    'edge_suggestion',
    'node_generation'
  ]),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.number().optional(),
  result: z.unknown().optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime()
})

export const NodeEnrichmentResultSchema = z.object({
  description: z.string(),
  enrichedContent: z.string(),
  examples: z.array(z.string()),
  sources: z.array(z.string()),
  suggestedEdges: z.array(
    z.object({
      targetLabel: z.string(),
      relationType: z.string(),
      confidence: z.number()
    })
  )
})

export const EdgeSuggestionSchema = z.object({
  sourceLabel: z.string(),
  targetLabel: z.string(),
  relationType: z.string(),
  confidence: z.number(),
  reason: z.string()
})

export const KnowledgeGapSchema = z.object({
  type: z.string(),
  description: z.string(),
  severity: z.string(),
  suggestedNodes: z.array(z.string())
})

// Response types for AI operations
export const EdgeSuggestionResultSchema = z.object({
  suggestions: z.array(EdgeSuggestionSchema),
  tokensUsed: z.number()
})

export const GapDetectionResultSchema = z.object({
  gaps: z.array(KnowledgeGapSchema),
  missingConcepts: z.array(z.string()),
  recommendations: z.array(z.string()),
  tokensUsed: z.number()
})

export const GeneratedNodeSchema = z.object({
  label: z.string(),
  type: z.string(),
  content: z.string(),
  description: z.string(),
  connections: z.array(EdgeSuggestionSchema)
})

export const MissingNodesResultSchema = z.object({
  nodes: z.array(GeneratedNodeSchema),
  tokensUsed: z.number()
})

export type AITask = z.infer<typeof AITaskSchema>
export type NodeEnrichmentResult = z.infer<typeof NodeEnrichmentResultSchema>
export type EdgeSuggestion = z.infer<typeof EdgeSuggestionSchema>
export type KnowledgeGap = z.infer<typeof KnowledgeGapSchema>
export type EdgeSuggestionResult = z.infer<typeof EdgeSuggestionResultSchema>
export type GapDetectionResult = z.infer<typeof GapDetectionResultSchema>
export type GeneratedNode = z.infer<typeof GeneratedNodeSchema>
export type MissingNodesResult = z.infer<typeof MissingNodesResultSchema>

export type EnrichType = 'description' | 'examples' | 'sources' | 'all'

export const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  free: z.boolean().optional()
})

export type AIModel = z.infer<typeof AIModelSchema>
