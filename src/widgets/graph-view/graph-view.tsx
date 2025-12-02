import { memo } from 'react'
import type { Edge, FullMap, Node } from '@/entities/map'
// Switch graph engine by commenting/uncommenting:
// import { GraphVisualization } from '@/features/graph'         // xyflow (React Flow)
import { GraphVisualization } from '@/features/graph-webgl'  // WebGL + WASM (high-performance)
import { NodeConnectionsPanel } from '@/features/node-connections-panel'

interface GraphViewProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
}

/**
 * Widget that composes GraphVisualization with NodeConnectionsPanel
 * Avoids cross-feature imports by composing at widget layer
 */
export const GraphView = memo(({ mapId, className, interactive, initialData }: GraphViewProps) => {
  return (
    <GraphVisualization
      mapId={mapId}
      className={className}
      interactive={interactive}
      initialData={initialData}
      renderConnectionsPanel={(
        node: Node,
        edges: Edge[],
        allNodes: Node[],
        onOpenNode?: (id: string) => void,
        onPanToNode?: (id: string) => void
      ) => (
        <NodeConnectionsPanel
          node={node}
          edges={edges}
          allNodes={allNodes}
          onOpenNode={onOpenNode}
          onPanToNode={onPanToNode}
        />
      )}
    />
  )
})

GraphView.displayName = 'GraphView'
