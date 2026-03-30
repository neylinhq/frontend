import { memo } from 'react'

import { GraphXYFlowVisualization as GraphXYFlow } from '@/features/graph/graph-core'
import { GraphWebGLVisualization as GraphWebGL } from '@/features/graph/graph-webgl'
import type { ViewportState } from '@/shared/lib/viewport'
import {
  useMasteryMap,
  useMasteryOverlay,
  usePracticeModeActions,
  useSessionScopeGuard,
} from '@/features/practice-mode'
import { useMapActiveTab } from '@/entities/map-ui'
import type { FullMap, Node } from '@/entities/map'
import { ErrorBoundary } from '@/shared/components/error-boundary'

interface GraphViewProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
  /** Callback when node is selected — for external management (sidebar) */
  onNodeSelect?: (node: Node | null) => void
  /** Callback when viewport changes (pan/zoom) */
  onViewportChange?: (viewport: ViewportState) => void
  /** AI panel state — when provided, overrides internal useAIPanelStore */
  isAIPanelOpen?: boolean
  onToggleAIPanel?: () => void
  /** Callback when map title clicked — open settings */
  onOpenSettings?: () => void
  /** Engine mode — controlled by parent */
  useWebGL?: boolean
}

/**
 * Widget that composes GraphVisualization with cross-feature dependencies.
 * All feature-to-feature wiring happens here at the widget layer (FSD pattern).
 */
export const GraphView = memo(({
  mapId,
  className,
  interactive,
  initialData,
  onNodeSelect,
  onViewportChange,
  isAIPanelOpen,
  onToggleAIPanel,
  onOpenSettings,
  useWebGL: useWebGLProp = true
}: GraphViewProps) => {
  const GraphVisualization = useWebGLProp ? GraphWebGL : GraphXYFlow

  // Practice mode
  const activeTab = useMapActiveTab(mapId)
  const isPracticeModeActive = activeTab === 'practice'
  const masteryMap = useMasteryMap()
  const { selectNode: selectPracticeNode } = usePracticeModeActions()
  useMasteryOverlay(mapId)
  useSessionScopeGuard(mapId)

  // In practice mode, clicking a node opens its detail in the practice panel
  const handleNodeSelect = (node: Node | null) => {
    if (isPracticeModeActive && node) {
      selectPracticeNode(node.id)
    }
    onNodeSelect?.(node)
  }

  return (
    <ErrorBoundary level='widget'>
      <GraphVisualization
        key={useWebGLProp ? 'webgl' : 'xyflow'}
        mapId={mapId}
        className={className}
        interactive={interactive}
        initialData={initialData}
        isAIPanelOpen={isAIPanelOpen}
        onToggleAIPanel={onToggleAIPanel}
        onOpenSettings={onOpenSettings}
        onNodeSelect={handleNodeSelect}
        onViewportChange={onViewportChange}
        isPracticeModeActive={isPracticeModeActive}
        masteryMap={masteryMap}
      />
    </ErrorBoundary>
  )
})

GraphView.displayName = 'GraphView'
