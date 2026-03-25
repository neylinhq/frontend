import { memo } from 'react'

import { GraphXYFlowVisualization as GraphXYFlow } from '@/features/graph/graph-core'
import { GraphWebGLVisualization as GraphWebGL } from '@/features/graph/graph-webgl'
import type { ViewportState } from '@/features/graph/graph-webgl'
import { MapSettingsDrawer } from '@/features/map-settings'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { NodeMetadataForm } from '@/features/node-metadata-form'
import {
  useMasteryMap,
  useMasteryOverlay,
  usePracticeModeActions,
  usePracticeModeActive,
} from '@/features/practice-mode'
import type { Edge, FullMap, Node } from '@/entities/map'
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
  const isPracticeModeActive = usePracticeModeActive()
  const masteryMap = useMasteryMap()
  const { selectNode: selectPracticeNode } = usePracticeModeActions()
  useMasteryOverlay(mapId, initialData?.nodes)

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
        renderConnectionsPanel={(
          node: Node,
          edges: Edge[],
          allNodes: Node[],
          onOpenNode?: (id: string) => void,
          onPanToNode?: (id: string) => void,
          onEditEdge?: (edge: Edge) => void,
          onDeleteEdge?: (edgeId: string) => void
        ) => (
          <NodeConnectionsPanel
            node={node}
            edges={edges}
            allNodes={allNodes}
            onOpenNode={onOpenNode}
            onPanToNode={onPanToNode}
            onEditEdge={onEditEdge}
            onDeleteEdge={onDeleteEdge}
          />
        )}
        renderMetadataForm={(node, onSubmit, isPending) => (
          <NodeMetadataForm node={node} onSubmit={onSubmit} isPending={isPending} />
        )}
        renderSettingsDrawer={(settingsMapId, open, onOpenChange) => (
          <MapSettingsDrawer mapId={settingsMapId} open={open} onOpenChange={onOpenChange} />
        )}
      />
    </ErrorBoundary>
  )
})

GraphView.displayName = 'GraphView'
