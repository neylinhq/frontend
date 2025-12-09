/**
 * NodeOverlay - Single node card (matching KnowledgeNode style)
 *
 * Uses CSS transform for scaling instead of manual size calculations.
 * This keeps text crisp and styling consistent with React Flow version.
 */

import { memo } from 'react'
import type { Node } from '@/entities/map'
import { getNodeIcon, getComplexityColor, getNodeBorderColor } from '@/entities/node'
import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib/cn'

interface NodeOverlayProps {
  node: Node
  screenX: number       // Screen X position (center)
  screenY: number       // Screen Y position (center)
  zoom: number          // Current zoom level
  isSelected: boolean
  isFocused: boolean
  isDimmed?: boolean
  onClick?: () => void
}

/** Zoom threshold for showing details */
const DETAIL_ZOOM_THRESHOLD = 0.3

/** Fixed node dimensions (before zoom transform) */
const NODE_WIDTH = 250
const NODE_HEIGHT = 120

/**
 * NodeOverlay renders a node card using CSS transform for scaling.
 */
export const NodeOverlay = memo(
  function NodeOverlay({
    node,
    screenX,
    screenY,
    zoom,
    isSelected,
    isFocused,
    isDimmed,
    onClick,
  }: NodeOverlayProps) {
    const Icon = getNodeIcon(node.type)
    const showDetails = zoom >= DETAIL_ZOOM_THRESHOLD

    // Position at center, transform handles the rest
    const left = screenX - (NODE_WIDTH * zoom) / 2
    const top = screenY - (NODE_HEIGHT * zoom) / 2

    return (
      <div
        className="absolute origin-top-left"
        style={{
          left,
          top,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          transform: `scale(${zoom})`,
        }}
        onClick={onClick}
      >
        <div
          className={cn(
            'w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto',
            'rounded-lg border shadow-sm overflow-hidden',
            // Left border color by node type
            'border-l-[3px]',
            getNodeBorderColor(node.type),
            'transition-shadow duration-200 hover:shadow-md',
            // Dimmed state
            isDimmed && 'opacity-40',
            // Focused state - pulsing glow
            isFocused && 'animate-glow-pulse',
            // Selected state
            isSelected && !isFocused && 'ring-2 ring-primary shadow-lg'
          )}
          style={{
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            borderColor: 'hsl(var(--border))',
          }}
        >
          <div className="p-4 flex flex-col h-full overflow-hidden">
            {/* Icon + Title */}
            <div className="flex items-start gap-2">
              <Icon className="w-5 h-5 flex-shrink-0 text-muted-foreground mt-0.5" />
              <h3 className="text-base font-semibold leading-tight break-words line-clamp-2">
                {node.label}
              </h3>
            </div>

            {/* Tags */}
            {showDetails && node.metadata.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.metadata.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs pointer-events-none"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Complexity badge */}
            {showDetails && node.metadata.complexity && (
              <div className="mt-auto pt-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs pointer-events-none',
                    getComplexityColor(node.metadata.complexity)
                  )}
                >
                  {node.metadata.complexity}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
  // Custom memo comparator
  (prev, next) => {
    return (
      prev.node.id === next.node.id &&
      prev.node.label === next.node.label &&
      prev.node.type === next.node.type &&
      prev.node.metadata?.complexity === next.node.metadata?.complexity &&
      Math.abs(prev.screenX - next.screenX) < 1 &&
      Math.abs(prev.screenY - next.screenY) < 1 &&
      Math.abs(prev.zoom - next.zoom) < 0.01 &&
      prev.isSelected === next.isSelected &&
      prev.isFocused === next.isFocused &&
      prev.isDimmed === next.isDimmed
    )
  }
)
