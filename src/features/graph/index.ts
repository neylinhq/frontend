// Components
export { GraphToolbar } from './components/graph-toolbar'

// GraphVisualization - switches between xyflow and WebGL based on feature flag
import { USE_WEBGL_RENDERER, GraphVisualization as GraphWebGL } from '@/features/graph-webgl'
import { GraphVisualization as GraphXYFlow } from './components/graph-visualization'
export const GraphVisualization = USE_WEBGL_RENDERER ? GraphWebGL : GraphXYFlow

// Export xyflow version explicitly for fallback
export { GraphVisualization as GraphXYFlowVisualization } from './components/graph-visualization'

export { KnowledgeEdge } from './components/knowledge-edge'
export { KnowledgeNode } from './components/knowledge-node'
export { NodeContextMenu } from './components/node-context-menu'
export { NodeSearch, NodeSearchTrigger } from './components/node-search'
export { ViewControlsPanel } from './components/view-controls-panel'
// Lib (pure utilities)
export { calculateDensity, calculateGraphCenter } from './lib/calculate-metrics'
export { getEdgeDashArray, getEdgeStroke, getEdgeWidth } from './lib/get-edge-style'
export { applyLayout, getNodesWithinDepth } from './lib/layout-algorithms-optimized'
export { transformEdgesToFlow, transformNodesToFlow } from './lib/transform-data'
export { getEdgeTranslations, getEdgeTypeLabel, type EdgeTranslations } from './lib/edge-translations'
// Model - Store
export {
  ALL_EDGE_TYPES,
  ALL_NODE_TYPES,
  type GraphViewState,
  layoutEvent,
  triggerLayout,
  useFilters,
  useFocusMode,
  useGraphUI,
  useGraphViewStore,
  useNodeSpacing,
  useViewMode,
  type ViewMode
} from './model/graph.store'
// Model - Hooks
export { useGraphControls } from './model/graph.controls.hooks'
export { useFilteredGraphData } from './model/graph.data.hooks'
export { useGraphKeyboard } from './model/graph.keyboard.hooks'
export { useAnimatedLayout } from './model/graph.layout.hooks'
export {
  useDebouncedZoom,
  useDiscreteZoom,
  getSnappedZoom,
  getZoomLevel,
  ZOOM_THRESHOLDS,
  type ZoomLevel
} from './model/graph.zoom.hooks'
// Model - Types
export type {
  DisplayMode,
  GraphControls,
  NodeDetailsDrawerProps,
  SelectedElements,
  ToolbarState
} from './model/graph-visualization.types'
export { useNodeSelection } from './model/graph.selection.hooks'
