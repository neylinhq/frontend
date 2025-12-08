// Schema exports

// API exports
export { aiApi } from './ai.api'
// Query exports
export {
  aiKeys,
  useAIModels,
  useAITask,
  useAnalyzeMap,
  useDetectGaps,
  useEnrichNode,
  useGenerateExercises,
  useSuggestEdges
} from './ai.queries'
export type {
  AIModel,
  AITask,
  EdgeSuggestion,
  EnrichType,
  KnowledgeGap,
  NodeEnrichmentResult
} from './ai.schema'
export {
  AIModelSchema,
  AITaskSchema,
  EdgeSuggestionSchema,
  KnowledgeGapSchema,
  NodeEnrichmentResultSchema
} from './ai.schema'
