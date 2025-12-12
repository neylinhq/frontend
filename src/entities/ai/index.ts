// Schema exports

// API exports
export { aiApi } from './ai.api'
export type { ChatWithMapResponse, ProposalData, NodeReference } from './ai.api'
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
  EdgeSuggestionResult,
  EnrichType,
  GapDetectionResult,
  GeneratedNode,
  KnowledgeGap,
  MissingNodesResult,
  NodeEnrichmentResult
} from './ai.schema'
export {
  AIModelSchema,
  AITaskSchema,
  EdgeSuggestionResultSchema,
  EdgeSuggestionSchema,
  GapDetectionResultSchema,
  GeneratedNodeSchema,
  KnowledgeGapSchema,
  MissingNodesResultSchema,
  NodeEnrichmentResultSchema
} from './ai.schema'
