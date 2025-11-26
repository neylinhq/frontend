import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Position } from '@xyflow/react'
import {
  AlertTriangle,
  ArrowRight,
  Copy,
  Info,
  Link,
  Puzzle,
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { getEdgeDashArray, getEdgeStrokeByType, getEdgeWidth } from '../lib/get-edge-style'

const relationTypeIcons = {
  'is-a': Info,
  'has-a': Puzzle,
  causes: Zap,
  explains: ArrowRight,
  'related-to': Link,
  influences: TrendingUp,
  'part-of': Puzzle,
  prerequisite: RefreshCw,
  contradicts: AlertTriangle,
  'similar-to': Copy
}

const relationTypeColors = {
  'is-a':
    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-600',
  'has-a':
    'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/60 dark:text-green-200 dark:border-green-600',
  causes:
    'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/60 dark:text-red-200 dark:border-red-600',
  explains:
    'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-600',
  'related-to':
    'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-600',
  influences:
    'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-600',
  'part-of':
    'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/60 dark:text-teal-200 dark:border-teal-600',
  prerequisite:
    'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-600',
  contradicts:
    'bg-red-200 text-red-900 border-red-400 dark:bg-red-900/70 dark:text-red-100 dark:border-red-500',
  'similar-to':
    'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/60 dark:text-yellow-200 dark:border-yellow-600'
}

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

    const Icon = relationTypeIcons[data.relationType]
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
            strokeDasharray: getEdgeDashArray(data.metadata.confidence),
            opacity: isSelected ? 1 : 0.7
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
            className="nodrag nopan"
          >
            <Badge
              className={cn(
                'transition-all duration-200 cursor-pointer hover:shadow-md',
                relationTypeColors[data.relationType],
                isSelected && 'ring-2 ring-primary'
              )}
              variant="outline"
            >
              <Icon className="w-3 h-3 mr-1" />
              {t(`graph.edgeTypes.${data.relationType}`)}
              {data.label && <span className="ml-1 opacity-80">({data.label})</span>}
              {data.strength > 0.8 && <span className="ml-1 text-[10px]">{t('graph.edge.strong')}</span>}
              {data.strength < 0.3 && <span className="ml-1 text-[10px]">{t('graph.edge.weak')}</span>}
            </Badge>
          </div>
        </EdgeLabelRenderer>
      </>
    )
  }
)

KnowledgeEdge.displayName = 'KnowledgeEdge'
