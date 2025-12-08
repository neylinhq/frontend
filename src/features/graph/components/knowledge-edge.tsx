import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Position } from '@xyflow/react'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getEdgeTextClass } from '@/entities/edge'
import type { Edge } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { getEdgeDashArray, getEdgeStrokeByType, getEdgeWidth } from '../lib/get-edge-style'
import { useEdgeManagementStore } from '../model/edge-management.store'

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
  data?: Edge & { selected?: boolean }
}

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
    const { t } = useTranslation()
    const { startEdgeEditing } = useEdgeManagementStore()

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
    const labelOffset = data?.sourceNodeId && data?.targetNodeId
      ? data.sourceNodeId > data.targetNodeId ? -12 : 12
      : 0

    const isSelected = data?.selected ?? false

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!data) return

        // Calculate position for popover (use screen coordinates)
        startEdgeEditing(data, {
          x: e.clientX,
          y: e.clientY
        })
      },
      [data, startEdgeEditing]
    )

    // Guard: если нет data, не рендерим edge
    if (!data) {
      return null
    }

    // HSL color for background with opacity
    const edgeColorHsl = `var(--edge-${data.relationType})`

    return (
      <>
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth: getEdgeWidth(data.strength),
            stroke: getEdgeStrokeByType(data.relationType),
            strokeDasharray: getEdgeDashArray(data.metadata.confidence)
          }}
        />

        <EdgeLabelRenderer>
          <button
            type='button'
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + labelOffset}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              backgroundColor: `hsl(${edgeColorHsl} / ${isSelected ? 0.3 : 0.2})`
            }}
            className={cn(
              'nodrag nopan cursor-pointer rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
              getEdgeTextClass(data.relationType)
            )}
            onClick={handleClick}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = `hsl(${edgeColorHsl} / 0.3)`
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = `hsl(${edgeColorHsl} / 0.2)`
              }
            }}
          >
            {t(`graph.edgeTypes.${data.relationType}`)}
            {data.label && (
              <>
                <span className='mx-1.5'>•</span>
                {data.label}
              </>
            )}
          </button>
        </EdgeLabelRenderer>
      </>
    )
  }
)

KnowledgeEdge.displayName = 'KnowledgeEdge'
