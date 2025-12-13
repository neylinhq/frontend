// Schemas and types
export {
  MasteryLevelEnum,
  UserNodeProgressSchema,
  UserMapProgressSchema,
  ViewportSchema,
  DEFAULT_NODE_PROGRESS,
  type MasteryLevel,
  type UserNodeProgress,
  type UserMapProgress,
  type Viewport,
  type UpdateNodeProgressRequest,
  type UpdateMapProgressRequest,
  type ReviewNodeRequest
} from './progress.schema'

// Enriched node utilities
export {
  type EnrichedNode,
  type EnrichedLightweightNode,
  enrichNodesWithProgress,
  getProgressStats
} from './progress.utils'

// API
export { progressApi } from './progress.api'

// React Query hooks
export {
  progressKeys,
  useNodeProgress,
  useAllNodeProgress,
  useUpdateNodeProgress,
  useReviewNode,
  useToggleBookmark,
  useMapProgress,
  useUpdateViewport,
  useSetFavorite,
  useMapStats
} from './progress.queries'
