/**
 * DomOverlay - DOM layer for text, icons, and badges
 *
 * Renders only visible nodes from viewport culling.
 * WebGL renders the backgrounds/edges, this renders the content.
 */

import { memo } from 'react'
import type { Node } from '@/entities/map'
import type { ViewportState } from '../lib/types'
import { NodeOverlay } from './node-overlay'

interface DomOverlayProps {
  nodes: Node[]
  viewport: ViewportState
  selectedNodeId: string | null
  focusedNodeId: string | null
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number }
}

/**
 * DOM Overlay renders text/icons for visible nodes
 *
 * PERFORMANCE: Only renders nodes that are in the viewport (culled by WASM).
 * Uses position:absolute with transform for each node.
 */
export const DomOverlay = memo(function DomOverlay({
  nodes,
  viewport,
  selectedNodeId,
  focusedNodeId,
  worldToScreen,
}: DomOverlayProps) {
  // LOD: Show details only at zoom > 20%
  const showDetails = viewport.zoom >= 0.2

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {nodes.map((node) => {
        // Convert world position to screen position
        const screen = worldToScreen(node.position.x, node.position.y)

        // Scale node dimensions by zoom
        const width = (node.width || 200) * viewport.zoom
        const height = (node.height || 100) * viewport.zoom

        return (
          <NodeOverlay
            key={node.id}
            node={node}
            screenX={screen.x}
            screenY={screen.y}
            width={width}
            height={height}
            zoom={viewport.zoom}
            showDetails={showDetails}
            isSelected={selectedNodeId === node.id}
            isFocused={focusedNodeId === node.id}
          />
        )
      })}
    </div>
  )
})
