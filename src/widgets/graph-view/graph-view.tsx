import { memo } from 'react'

// Switch graph engine by commenting/uncommenting:
import { GraphVisualization } from '@/features/graph/graph-core' // xyflow (React Flow)
// import { GraphVisualization } from '@/features/graph/graph-webgl'  // WebGL + WASM (high-performance)
import { useAIPanelStore } from '@/features/ai-assist'
import { MapSettingsDrawer } from '@/features/map-settings'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { NodeMetadataForm } from '@/features/node-metadata-form'
import type { Edge, FullMap, Node } from '@/entities/map'
import { ErrorBoundary } from '@/shared/components/error-boundary'

interface GraphViewProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
}

/**
 * Widget that composes GraphVisualization with cross-feature dependencies.
 * All feature-to-feature wiring happens here at the widget layer (FSD pattern).
 */
export const GraphView = memo(({ mapId, className, interactive, initialData }: GraphViewProps) => {
  const { isOpen: isAIPanelOpen, toggle: toggleAIPanel, close: closeAIPanel } = useAIPanelStore()

  return (
    <ErrorBoundary level='widget'>
      <GraphVisualization
        mapId={mapId}
        className={className}
        interactive={interactive}
        initialData={initialData}
        isAIPanelOpen={isAIPanelOpen}
        onToggleAIPanel={toggleAIPanel}
        onCloseAIPanel={closeAIPanel}
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
