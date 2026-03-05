// Components
export { GraphToolbar } from './components/graph-toolbar'
export { NodeDrawer } from './components/node-drawer'

// GraphVisualization - switches between xyflow and WebGL based on feature flag
import { GraphVisualization as GraphWebGL, USE_WEBGL_RENDERER } from '@/features/graph/graph-webgl'

import { GraphVisualization as GraphXYFlow } from './components/graph-visualization'
export const GraphVisualization = USE_WEBGL_RENDERER ? GraphWebGL : GraphXYFlow

// Export xyflow version explicitly for fallback
export { GraphVisualization as GraphXYFlowVisualization } from './components/graph-visualization'
export { EdgeEditPopover } from './components/edge-edit-popover'

export { KnowledgeEdge } from './components/knowledge-edge'
export { KnowledgeNode } from './components/knowledge-node'
export { NodeContextMenu } from './components/node-context-menu'
export { NodeSearch, NodeSearchTrigger } from './components/node-search'
export { ViewControlsPanel } from './components/view-controls-panel'
// Lib (pure utilities)
export { calculateDensity, calculateGraphCenter } from './lib/calculate-metrics'
export {
  type EdgeTranslations,
  getEdgeTranslations,
  getEdgeTypeLabel
} from './lib/edge-translations'
export { getEdgeDashArray, getEdgeStroke, getEdgeWidth } from './lib/get-edge-style'
export { applyLayout, getNodesWithinDepth } from './lib/layout-algorithms-optimized'
export { transformEdgesToFlow, transformNodesToFlow } from './lib/transform-data'
// Model - Hooks
export { useGraphControls } from './model/graph.controls.hooks'
export { useFilteredGraphData } from './model/graph.data.hooks'
export { useGraphKeyboard } from './model/graph.keyboard.hooks'
export { useAnimatedLayout } from './model/graph.layout.hooks'
export { useNodeSelection } from './model/graph.selection.hooks'
// Model - Edge management store
export { useEdgeManagementStore } from './model/graph.edge.store'

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
export {
  getSnappedZoom,
  getZoomLevel,
  useDebouncedZoom,
  useDiscreteZoom,
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
