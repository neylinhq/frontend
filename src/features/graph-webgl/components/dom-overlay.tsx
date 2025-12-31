/**
 * DomOverlay - DOM layer for nodes and edges
 *
 * Renders only visible nodes (viewport culling) for performance.
 * Uses SVG for edges and DOM for node cards.
 */

import { memo, useMemo } from 'react'
import type { Edge, Node } from '@/entities/map'
import { EdgeOverlay } from '@/features/graph-webgl/components/edge-overlay'
import { NodeOverlay } from '@/features/graph-webgl/components/node-overlay'
import type { ViewportState } from '../model/graph-webgl.types'

/** Fixed node dimensions for culling calculations */
const NODE_WIDTH = 250
const NODE_HEIGHT = 120

interface DomOverlayProps {
  nodes: Node[]
  edges: Edge[]
  viewport: ViewportState
  selectedNodeId: string | null
  focusedNodeId: string | null
  dimmedNodeIds?: string[]
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number }
  onNodeClick?: (nodeId: string) => void
}

/**
 * DOM Overlay renders nodes and edges with viewport culling
 */
export const DomOverlay = memo(function DomOverlay({
  nodes,
  edges,
  viewport,
  selectedNodeId,
  focusedNodeId,
  dimmedNodeIds = [],
  worldToScreen,
  onNodeClick
}: DomOverlayProps) {
  // Calculate visible bounds with padding (in world coordinates)
  const visibleBounds = useMemo(() => {
    const padding = 300 // Extra padding to avoid pop-in
    const halfW = viewport.width / 2 / viewport.zoom + padding
    const halfH = viewport.height / 2 / viewport.zoom + padding
    return {
      minX: viewport.x - halfW,
      maxX: viewport.x + halfW,
      minY: viewport.y - halfH,
      maxY: viewport.y + halfH
    }
  }, [viewport.x, viewport.y, viewport.width, viewport.height, viewport.zoom])

  // Filter visible nodes (viewport culling)
  const visibleNodes = useMemo(() => {
    return nodes.filter(node => {
      const x = node.position.x
      const y = node.position.y
      const w = NODE_WIDTH / 2
      const h = NODE_HEIGHT / 2
      return (
        x + w >= visibleBounds.minX &&
        x - w <= visibleBounds.maxX &&
        y + h >= visibleBounds.minY &&
        y - h <= visibleBounds.maxY
      )
    })
  }, [nodes, visibleBounds])

  // Create node position map for edges
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    for (const node of nodes) {
      map.set(node.id, { x: node.position.x, y: node.position.y })
    }
    return map
  }, [nodes])

  // Filter visible edges
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id))
    return edges.filter(edge => {
      return visibleNodeIds.has(edge.sourceNodeId) || visibleNodeIds.has(edge.targetNodeId)
    })
  }, [edges, visibleNodes])

  // Dimmed node set for O(1) lookup
  const dimmedSet = useMemo(() => new Set(dimmedNodeIds), [dimmedNodeIds])

  return (
    <div className='absolute inset-0 pointer-events-none overflow-hidden'>
      {/* SVG layer for edges */}
      <svg
        className='absolute inset-0'
        style={{ zIndex: 0 }}
        width={viewport.width}
        height={viewport.height}
      >
        {visibleEdges.map(edge => {
          const source = nodePositions.get(edge.sourceNodeId)
          const target = nodePositions.get(edge.targetNodeId)
          if (!source || !target) {
            return null
          }

          const sourceScreen = worldToScreen(source.x, source.y)
          const targetScreen = worldToScreen(target.x, target.y)

          return (
            <EdgeOverlay
              key={edge.id}
              edge={edge}
              sourceX={sourceScreen.x}
              sourceY={sourceScreen.y}
              targetX={targetScreen.x}
              targetY={targetScreen.y}
              zoom={viewport.zoom}
            />
          )
        })}
      </svg>

      {/* DOM layer for nodes */}
      <div className='absolute inset-0' style={{ zIndex: 1 }}>
        {visibleNodes.map(node => {
          const screen = worldToScreen(node.position.x, node.position.y)

          return (
            <NodeOverlay
              key={node.id}
              node={node}
              screenX={screen.x}
              screenY={screen.y}
              zoom={viewport.zoom}
              isSelected={selectedNodeId === node.id}
              isFocused={focusedNodeId === node.id}
              isDimmed={dimmedSet.has(node.id)}
              onClick={() => onNodeClick?.(node.id)}
            />
          )
        })}
      </div>
    </div>
  )
})
