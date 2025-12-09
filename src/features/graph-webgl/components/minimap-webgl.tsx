/**
 * MiniMapWebGL - Simplified minimap for WebGL graph
 *
 * Renders a small overview of the entire graph using DOM divs.
 * Shows node positions as colored dots based on node type.
 */

import { memo, useMemo } from 'react'
import type { Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

interface MiniMapWebGLProps {
  nodes: Node[]
  isDark?: boolean
  className?: string
}

// Colors for node types (matching React Flow minimap)
const NODE_COLORS: Record<string, string> = {
  concept: '#3b82f6',    // blue
  theory: '#8b5cf6',     // purple
  fact: '#10b981',       // green
  example: '#f59e0b',    // amber
  definition: '#ef4444', // red
  question: '#ec4899',   // pink
}

const DEFAULT_NODE_COLOR = '#64748b' // slate

/**
 * MiniMapWebGL renders a simplified overview of the graph.
 *
 * Uses DOM divs instead of canvas for simplicity.
 * Performance is good for up to ~1000 nodes.
 */
export const MiniMapWebGL = memo(function MiniMapWebGL({
  nodes,
  isDark = false,
  className
}: MiniMapWebGLProps) {
  // Calculate bounds and scale
  const { bounds, scale, nodeDots } = useMemo(() => {
    if (nodes.length === 0) {
      return {
        bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
        scale: 1,
        nodeDots: []
      }
    }

    // Find bounds
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity

    for (const node of nodes) {
      const x = node.position.x
      const y = node.position.y
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }

    // Add padding
    const padding = 50
    minX -= padding
    maxX += padding
    minY -= padding
    maxY += padding

    const boundsWidth = maxX - minX
    const boundsHeight = maxY - minY

    // Minimap dimensions
    const mapWidth = 150
    const mapHeight = 100

    // Calculate scale to fit
    const scaleX = mapWidth / boundsWidth
    const scaleY = mapHeight / boundsHeight
    const scale = Math.min(scaleX, scaleY)

    // Calculate node positions in minimap coords
    const nodeDots = nodes.map(node => ({
      id: node.id,
      x: (node.position.x - minX) * scale,
      y: (node.position.y - minY) * scale,
      color: NODE_COLORS[node.type] || DEFAULT_NODE_COLOR
    }))

    return {
      bounds: { minX, minY, maxX, maxY },
      scale,
      nodeDots
    }
  }, [nodes])

  if (nodes.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 w-[150px] h-[100px]',
        'bg-background/90 border border-border rounded-md shadow-sm',
        'overflow-hidden',
        className
      )}
      style={{
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* Node dots */}
      {nodeDots.map(dot => (
        <div
          key={dot.id}
          className='absolute w-1.5 h-1.5 rounded-full'
          style={{
            left: dot.x - 3,
            top: dot.y - 3,
            backgroundColor: dot.color
          }}
        />
      ))}

      {/* Viewport indicator (placeholder - would need viewport state) */}
      <div
        className='absolute border border-primary/50 bg-primary/10 rounded-sm pointer-events-none'
        style={{
          left: '25%',
          top: '25%',
          width: '50%',
          height: '50%'
        }}
      />
    </div>
  )
})
