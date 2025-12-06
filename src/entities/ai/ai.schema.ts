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

export type AITask = z.infer<typeof AITaskSchema>
export type NodeEnrichmentResult = z.infer<typeof NodeEnrichmentResultSchema>
export type EdgeSuggestion = z.infer<typeof EdgeSuggestionSchema>
export type KnowledgeGap = z.infer<typeof KnowledgeGapSchema>

export type EnrichType = 'description' | 'examples' | 'sources' | 'all'
