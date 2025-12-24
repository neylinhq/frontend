import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Position } from '@xyflow/react'
import { memo, useCallback } from 'react'
import { getEdgeTextClass } from '@/entities/edge'
import type { Edge } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { getEdgeDashArray, getEdgeStrokeByType, getEdgeWidth } from '../lib/get-edge-style'

interface KnowledgeEdgeProps {
  id: string
  sourceX: number
  sourceY: number
  sourcePosition: Position
  targetX: number
  targetY: number
  targetPosition: Position
  style?: React.CSSProperties
  markerEnd?: string
  data?: Edge & {
    selected?: boolean
    /** Zoom level passed from parent - avoids useViewport() per-edge subscription */
    zoom?: number
    /** Pre-translated label for this edge type - avoids useTranslation() per-edge */
    translatedType?: string
    /** Callback for edge editing - passed from parent to avoid store subscription */
    onStartEditing?: (edge: Edge, position: { x: number; y: number }) => void
  }
}

/**
 * KnowledgeEdge - Custom edge component for graph visualization
 *
 * PERFORMANCE OPTIMIZATIONS:
 * 1. zoom passed via data prop (not useViewport())
 * 2. translatedType passed via data prop (not useTranslation())
 * 3. onStartEditing callback passed via data prop (not store subscription)
 *
 * This eliminates 3 hook subscriptions per edge, reducing re-renders by ~95%
 */
export const KnowledgeEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    style,
    markerEnd,
    data
  }: KnowledgeEdgeProps) => {
    const zoom = data?.zoom ?? 1

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    })

    // Calculate perpendicular offset to prevent badge overlap for counter-edges (A→B and B→A)
    // Using deterministic offset based on sourceNodeId vs targetNodeId comparison
    const labelOffset =
      data?.sourceNodeId && data?.targetNodeId
        ? data.sourceNodeId > data.targetNodeId
          ? -12
          : 12
        : 0

    const isSelected = data?.selected ?? false

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!data) {
          return
        }

        // Use callback from parent instead of store subscription
        data.onStartEditing?.(data, {
          x: e.clientX,
          y: e.clientY
        })
      },
      [data]
    )

    // Guard: если нет data, не рендерим edge
    if (!data) {
      return null
    }

    // OKLCH color for background with opacity
    const edgeColor = `var(--edge-${data.relationType})`

    // LOD: At low zoom, increase stroke width for visibility and hide label
    const isLowZoom = zoom < 0.05
    const baseWidth = getEdgeWidth(data.strength)
    // Scale stroke width inversely with zoom (but cap it)
    const strokeWidth = isLowZoom ? Math.min(baseWidth / zoom, 15) : baseWidth

    // Get translated type label (passed from parent, fallback to raw type)
    const typeLabel = data.translatedType ?? data.relationType

    return (
      <>
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth,
            stroke: getEdgeStrokeByType(data.relationType),
            strokeDasharray: isLowZoom ? undefined : getEdgeDashArray(data.metadata.confidence)
          }}
        />

        {!isLowZoom && (
          <EdgeLabelRenderer>
            <button
              type='button'
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + labelOffset}px)`,
                fontSize: 12,
                pointerEvents: 'all',
                backgroundColor: `oklch(${edgeColor} / ${isSelected ? 0.3 : 0.2})`
              }}
              className={cn(
                'nodrag nopan cursor-pointer rounded-xs px-2.5 py-0.5 text-xs font-medium leading-none transition-colors',
                getEdgeTextClass(data.relationType)
              )}
              onClick={handleClick}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = `oklch(${edgeColor} / 0.3)`
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = `oklch(${edgeColor} / 0.2)`
                }
              }}
            >
              {typeLabel}
              {data.label && (
                <>
                  <span className='mx-1.5'>•</span>
                  {data.label}
                </>
              )}
            </button>
          </EdgeLabelRenderer>
        )}
      </>
    )
  }
)

KnowledgeEdge.displayName = 'KnowledgeEdge'
