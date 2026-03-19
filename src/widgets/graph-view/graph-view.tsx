import { memo, useState } from 'react'

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
  usePracticeModeStats
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
  onOpenSettings
}: GraphViewProps) => {
  const [useWebGL, setUseWebGL] = useState(true)
  const GraphVisualization = useWebGL ? GraphWebGL : GraphXYFlow

  // Practice mode
  const isPracticeModeActive = usePracticeModeActive()
  const practiceModeStats = usePracticeModeStats()
  const masteryMap = useMasteryMap()
  const { enter: enterPractice, exit: exitPractice } = usePracticeModeActions()
  useMasteryOverlay(mapId)

  const togglePracticeMode = () => {
    if (isPracticeModeActive) {
      exitPractice()
    } else {
      enterPractice()
    }
  }

  return (
    <ErrorBoundary level='widget'>
      {/* Debug: engine toggle */}
      <button
        type='button'
        onClick={() => setUseWebGL(v => !v)}
        className='fixed bottom-6 right-24 z-50 rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-md hover:text-foreground transition-colors'
      >
        {useWebGL ? 'WebGL' : 'React Flow'}
      </button>

      <GraphVisualization
        key={useWebGL ? 'webgl' : 'xyflow'}
        mapId={mapId}
        className={className}
        interactive={interactive}
        initialData={initialData}
        isAIPanelOpen={isAIPanelOpen}
        onToggleAIPanel={onToggleAIPanel}
        onOpenSettings={onOpenSettings}
        onNodeSelect={onNodeSelect}
        onViewportChange={onViewportChange}
        isPracticeModeActive={isPracticeModeActive}
        onTogglePracticeMode={togglePracticeMode}
        practiceModeStats={practiceModeStats}
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
