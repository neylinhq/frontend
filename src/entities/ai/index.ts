// Schema exports

// API exports
export { aiApi } from './ai.api'
// Query exports
export {
  aiKeys,
  useAITask,
  useAnalyzeMap,
  useDetectGaps,
  useEnrichNode,
  useGenerateExercises,
  useSuggestEdges
} from './ai.queries'
export type {
  AITask,
  EdgeSuggestion,
  EnrichType,
  KnowledgeGap,
  NodeEnrichmentResult
} from './ai.schema'
export {
  AITaskSchema,
  EdgeSuggestionSchema,
  KnowledgeGapSchema,
  NodeEnrichmentResultSchema
} from './ai.schema'
