import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { getEdgeDashArray, getEdgeStrokeByType, getEdgeWidth } from '../lib/get-edge-style'

// Badge colors matching edge stroke colors using Tailwind (-200 for light theme saturation)
const relationTypeColors: Record<string, string> = {
  prerequisite:
    'bg-orange-200 text-orange-800 border-transparent dark:bg-orange-950/50 dark:text-orange-300',
  causes: 'bg-red-200 text-red-800 border-transparent dark:bg-red-950/50 dark:text-red-300',
  explains:
    'bg-violet-200 text-violet-800 border-transparent dark:bg-violet-950/50 dark:text-violet-300',
  'is-a':
    'bg-indigo-200 text-indigo-800 border-transparent dark:bg-indigo-950/50 dark:text-indigo-300',
  'has-a':
    'bg-emerald-200 text-emerald-800 border-transparent dark:bg-emerald-950/50 dark:text-emerald-300',
  'part-of': 'bg-teal-200 text-teal-800 border-transparent dark:bg-teal-950/50 dark:text-teal-300',
  influences:
    'bg-amber-200 text-amber-800 border-transparent dark:bg-amber-950/50 dark:text-amber-300',
  'related-to':
    'bg-slate-200 text-slate-800 border-transparent dark:bg-slate-950/50 dark:text-slate-300',
  contradicts: 'bg-red-300 text-red-900 border-transparent dark:bg-red-900/50 dark:text-red-200',
  'similar-to':
    'bg-lime-200 text-lime-800 border-transparent dark:bg-lime-950/50 dark:text-lime-300'
}

interface KnowledgeEdgeProps {
  id: string
  sourceX: number
  sourceY: number
  sourcePosition: any
  targetX: number
  targetY: number
  targetPosition: any
  style?: any
  markerEnd?: any
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
                relationTypeColors[data.relationType] ||
                  'bg-slate-200 text-slate-800 border-transparent',
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
