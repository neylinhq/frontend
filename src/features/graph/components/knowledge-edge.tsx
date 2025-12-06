import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Position } from '@xyflow/react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { getEdgeBadgeClass } from '@/entities/edge'
import type { Edge } from '@/entities/map'
import { Badge } from '@/shared/components/badge'
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
  data: Edge & { selected?: boolean }
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

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    })

    const isSelected = data.selected

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
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all'
            }}
            className='nodrag nopan'
          >
            <Badge
              className={cn(
                'transition-colors',
                getEdgeBadgeClass(data.relationType),
                isSelected && 'ring-2 ring-primary'
              )}
            >
              {t(`graph.edgeTypes.${data.relationType}`)}
              {data.label && (
                <>
                  <span className='mx-1.5'>•</span>
                  {data.label}
                </>
              )}
            </Badge>
          </div>
        </EdgeLabelRenderer>
      </>
    )
  }
)

KnowledgeEdge.displayName = 'KnowledgeEdge'
