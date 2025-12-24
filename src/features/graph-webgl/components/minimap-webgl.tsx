/**
 * MiniMapWebGL - Simplified minimap for WebGL graph
 *
 * Renders a small overview of the entire graph using DOM divs.
 * Shows node positions as colored dots based on node type.
 * Displays current viewport as a rectangle.
 */

import { memo, useMemo } from 'react'
import type { Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { getNodeColorHex } from '../lib/theme-bridge'

interface ViewportState {
  x: number // Camera center X in world coords
  y: number // Camera center Y in world coords
  zoom: number // Zoom level
  width: number // Canvas width in pixels
  height: number // Canvas height in pixels
}

/** Position data from WASM layout */
interface LayoutPosition {
  id: string
  x: number
  y: number
}

interface MiniMapWebGLProps {
  nodes: Node[]
  layoutPositions?: LayoutPosition[] // Positions from WASM layout
  viewport?: ViewportState
  isDark?: boolean
  className?: string
  onNavigate?: (x: number, y: number) => void
}

// Minimap dimensions
const MAP_WIDTH = 150
const MAP_HEIGHT = 100

/**
 * MiniMapWebGL renders a simplified overview of the graph.
 *
 * Uses DOM divs instead of canvas for simplicity.
 * Performance is good for up to ~1000 nodes.
 */
export const MiniMapWebGL = memo(function MiniMapWebGL({
  nodes,
  layoutPositions,
  viewport,
  isDark: _isDark = false,
  className,
  onNavigate
}: MiniMapWebGLProps) {
  // Build position map from WASM layout (or use node.position as fallback)
  const positionMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    if (layoutPositions) {
      for (const pos of layoutPositions) {
        map.set(pos.id, { x: pos.x, y: pos.y })
      }
    }
    return map
  }, [layoutPositions])

  // Calculate bounds and scale
  const { bounds, scale, nodeDots } = useMemo(() => {
    if (nodes.length === 0) {
      return {
        bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 },
        scale: 1,
        nodeDots: []
      }
    }

    // Find bounds using WASM positions if available, fallback to node.position
    let minX = Infinity,
      maxX = -Infinity
    let minY = Infinity,
      maxY = -Infinity

    for (const node of nodes) {
      // Use WASM layout position if available, otherwise use node.position
      const layoutPos = positionMap.get(node.id)
      const x = layoutPos?.x ?? node.position.x
      const y = layoutPos?.y ?? node.position.y
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x + 200) // Add node width
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y + 100) // Add node height
    }

    // Add padding
    const padding = 100
    minX -= padding
    maxX += padding
    minY -= padding
    maxY += padding

    const boundsWidth = maxX - minX
    const boundsHeight = maxY - minY

    // Calculate scale to fit
    const scaleX = MAP_WIDTH / boundsWidth
    const scaleY = MAP_HEIGHT / boundsHeight
    const scale = Math.min(scaleX, scaleY)

    // Calculate node positions in minimap coords using WASM positions
    const nodeDots = nodes.map(node => {
      const layoutPos = positionMap.get(node.id)
      const x = layoutPos?.x ?? node.position.x
      const y = layoutPos?.y ?? node.position.y
      return {
        id: node.id,
        x: (x - minX) * scale,
        y: (y - minY) * scale,
        color: getNodeColorHex(node.type)
      }
    })

    return {
      bounds: { minX, minY, maxX, maxY, width: boundsWidth, height: boundsHeight },
      scale,
      nodeDots
    }
  }, [nodes, positionMap])

  // Calculate viewport rectangle in minimap coordinates
  const viewportRect = useMemo(() => {
    if (!viewport || nodes.length === 0) {
      // Default centered viewport
      return {
        left: MAP_WIDTH * 0.25,
        top: MAP_HEIGHT * 0.25,
        width: MAP_WIDTH * 0.5,
        height: MAP_HEIGHT * 0.5
      }
    }

    // Viewport visible area in world coordinates
    // Note: zoom is how much the world is scaled, so divide canvas size by zoom
    const viewWidth = viewport.width / viewport.zoom
    const viewHeight = viewport.height / viewport.zoom

    // Viewport center in world coords is (viewport.x, viewport.y)
    // Calculate top-left corner of visible area
    const viewMinX = viewport.x - viewWidth / 2
    const viewMinY = viewport.y - viewHeight / 2

    // Convert to minimap coordinates
    // X: direct mapping (world X increases right, minimap X increases right)
    const left = (viewMinX - bounds.minX) * scale

    // Y: needs inversion
    // In WASM viewport: y increases when we pan down (due to -dy in JS pan call)
    // But in minimap (DOM): y=0 is at top, increases downward
    // So we need to flip: when viewport.y increases, top should increase (move down in minimap)
    // This is already correct because both coordinate systems have Y increasing downward
    // after the -dy inversion in handleMouseMove
    const top = (viewMinY - bounds.minY) * scale
    const width = viewWidth * scale
    const height = viewHeight * scale

    // Clamp to minimap bounds but allow partial visibility
    return {
      left: Math.max(-width + 4, Math.min(left, MAP_WIDTH - 4)),
      top: Math.max(-height + 4, Math.min(top, MAP_HEIGHT - 4)),
      width: Math.max(4, Math.min(width, MAP_WIDTH * 2)),
      height: Math.max(4, Math.min(height, MAP_HEIGHT * 2))
    }
  }, [viewport, bounds, scale, nodes.length])

  // Handle click to navigate
  const handleClick = (e: React.MouseEvent) => {
    if (!onNavigate) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Convert minimap coords to world coords
    const worldX = bounds.minX + clickX / scale
    const worldY = bounds.minY + clickY / scale

    onNavigate(worldX, worldY)
  }

  if (nodes.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4',
        'bg-background/90 border border-border rounded-md',
        'overflow-hidden cursor-pointer',
        className
      )}
      style={{
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClick}
    >
      {/* Node dots */}
      {nodeDots.map(dot => (
        <div
          key={dot.id}
          className='absolute rounded-full pointer-events-none'
          style={{
            left: dot.x - 2,
            top: dot.y - 2,
            width: 4,
            height: 4,
            backgroundColor: dot.color
          }}
        />
      ))}

      {/* Viewport indicator */}
      <div
        className='absolute border-2 border-primary/70 bg-primary/5 rounded-md pointer-events-none'
        style={{
          left: viewportRect.left,
          top: viewportRect.top,
          width: viewportRect.width,
          height: viewportRect.height
        }}
      />
    </div>
  )
})
