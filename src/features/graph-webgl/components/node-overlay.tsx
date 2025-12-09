/**
 * NodeOverlay - Single node DOM content (text, icon, badges)
 *
 * This component renders only the text content of a node.
 * The background, border, selection ring are rendered by WebGL.
 */

import { memo } from 'react'
import type { Node } from '@/entities/map'
import { getNodeIcon, getComplexityColor } from '@/entities/node'
import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib/cn'

interface NodeOverlayProps {
  node: Node
  screenX: number       // Screen X position
  screenY: number       // Screen Y position
  width: number         // Scaled width
  height: number        // Scaled height
  zoom: number          // Current zoom level
  showDetails: boolean  // LOD: show tags and complexity
  isSelected: boolean
  isFocused: boolean
}

/**
 * NodeOverlay renders the text content of a node.
 *
 * PERFORMANCE: Uses custom memo comparator.
 * Only re-renders when actual visual state changes.
 */
export const NodeOverlay = memo(
  function NodeOverlay({
    node,
    screenX,
    screenY,
    width,
    height,
    zoom,
    showDetails,
    isSelected,
    isFocused,
  }: NodeOverlayProps) {
    const Icon = getNodeIcon(node.type)

    // Scale font size with zoom but clamp to readable range
    const baseFontSize = 16
    const scaledFontSize = Math.max(8, Math.min(24, baseFontSize * zoom))
    const iconSize = Math.max(12, Math.min(20, 20 * zoom))
    const padding = Math.max(8, 24 * zoom)

    return (
      <div
        className="absolute pointer-events-auto"
        style={{
          left: screenX,
          top: screenY,
          width,
          height,
          fontSize: scaledFontSize,
        }}
      >
        <div
          className="flex flex-col h-full"
          style={{ padding }}
        >
          {/* Icon + Title (always visible) */}
          <div className="flex items-start gap-2">
            <Icon
              className="flex-shrink-0 text-muted-foreground"
              style={{ width: iconSize, height: iconSize }}
            />
            <h3
              className="font-semibold leading-tight break-words"
              style={{
                fontSize: scaledFontSize,
                lineHeight: 1.2,
              }}
            >
              {node.label}
            </h3>
          </div>

          {/* Tags - under title, LOD: hidden at low zoom */}
          {showDetails && node.metadata.tags?.length > 0 && (
            <div
              className="flex flex-wrap gap-1 mt-1"
              style={{ marginTop: 4 * zoom }}
            >
              {node.metadata.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="pointer-events-none"
                  style={{
                    fontSize: Math.max(8, 12 * zoom),
                    padding: `${2 * zoom}px ${4 * zoom}px`,
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Complexity badge - pinned to bottom, LOD: hidden at low zoom */}
          {showDetails && node.metadata.complexity && (
            <div className="mt-auto" style={{ paddingTop: 8 * zoom }}>
              <Badge
                variant="secondary"
                className={cn(
                  'pointer-events-none',
                  getComplexityColor(node.metadata.complexity)
                )}
                style={{
                  fontSize: Math.max(8, 12 * zoom),
                  padding: `${2 * zoom}px ${6 * zoom}px`,
                }}
              >
                {node.metadata.complexity}
              </Badge>
            </div>
          )}
        </div>
      </div>
    )
  },
  // Custom memo comparator
  (prev, next) => {
    // Quick reference check
    if (prev.node === next.node && prev.screenX === next.screenX && prev.screenY === next.screenY) {
      return (
        prev.width === next.width &&
        prev.height === next.height &&
        prev.showDetails === next.showDetails &&
        prev.isSelected === next.isSelected &&
        prev.isFocused === next.isFocused
      )
    }

    // Deep check
    return (
      prev.node.id === next.node.id &&
      prev.node.label === next.node.label &&
      prev.node.type === next.node.type &&
      prev.node.metadata?.complexity === next.node.metadata?.complexity &&
      arraysEqual(prev.node.metadata?.tags, next.node.metadata?.tags) &&
      Math.abs(prev.screenX - next.screenX) < 0.5 &&
      Math.abs(prev.screenY - next.screenY) < 0.5 &&
      Math.abs(prev.width - next.width) < 0.5 &&
      Math.abs(prev.height - next.height) < 0.5 &&
      prev.showDetails === next.showDetails &&
      prev.isSelected === next.isSelected &&
      prev.isFocused === next.isFocused
    )
  }
)

// Helper for array comparison
function arraysEqual(a?: string[], b?: string[]): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}
