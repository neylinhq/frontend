// Schemas and types

// API
export { progressApi } from './progress.api'
// React Query hooks
export {
  progressKeys,
  useAllNodeProgress,
  useMapProgress,
  useMapStats,
  useNodeProgress,
  useReviewNode,
  useSetFavorite,
  useToggleBookmark,
  useUpdateMapProgress,
  useUpdateNodeProgress,
  useUpdateViewport
} from './progress.queries'
export {
  DEFAULT_NODE_PROGRESS,
  type MasteryLevel,
  MasteryLevelEnum,
  type ReviewNodeRequest,
  type UpdateMapProgressRequest,
  type UpdateNodeProgressRequest,
  type UserMapProgress,
  UserMapProgressSchema,
  type UserNodeProgress,
  UserNodeProgressSchema,
  type Viewport,
  ViewportSchema
} from './progress.schema'
// Enriched node utilities
export {
  type EnrichedLightweightNode,
  type EnrichedNode,
  enrichNodesWithProgress,
  getProgressStats
} from './progress.utils'
