import { Handle, Position } from '@xyflow/react'
import { Info } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { getComplexityColor, getNodeBorderColor, getNodeIcon } from '../lib/get-node-style'

interface KnowledgeNodeProps {
  data: Node & {
    selected?: boolean
    onSelect?: (id: string) => void
    isDimmed?: boolean
    isFocused?: boolean
  }
  id: string
}

export const KnowledgeNode = memo(({ data, id }: KnowledgeNodeProps) => {
  const { t, i18n } = useTranslation()
  const Icon = getNodeIcon(data.type)
  const isSelected = data.selected
  const isDimmed = data.isDimmed
  const isFocused = data.isFocused

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    data.onSelect?.(id)
  }

  const handleInfoMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <Card
      className={cn(
        'min-w-[200px] max-w-[300px] cursor-grab active:cursor-grabbing transition-all duration-200',
        'bg-card border-r border-t border-b border-border',
        'border-l-[3px]',
        getNodeBorderColor(data.type),
        'hover:shadow-md hover:scale-[1.01]',
        // Dimmed state - reduced opacity and grayscale
        isDimmed && 'opacity-40 grayscale hover:opacity-60 hover:grayscale-0',
        // Focused state - elegant glow with breathing animation
        isFocused && [
          'ring-2 ring-primary/60',
          'animate-pulse-subtle'
        ],
        // Selected state
        isSelected && !isFocused && [
          'ring-2 ring-primary shadow-lg scale-[1.02]',
          'dark:ring-offset-background ring-offset-1'
        ]
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-background"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary border-2 border-background"
      />

      <div className="p-4 space-y-3">
        {/* Заголовок с иконкой */}
        <div className="flex items-start gap-2">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight break-words">{data.label}</h3>
            {data.description && (
              <p className="text-xs opacity-80 mt-1 line-clamp-2">{data.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleInfoClick}
            onMouseDown={handleInfoMouseDown}
            className="flex-shrink-0 w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
            title={t('graph.node.moreDetails')}
          >
            <Info className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        </div>

        {/* Метаданные */}
        <div className="space-y-2">
          {/* Сложность и уверенность */}
          <div className="flex gap-2 flex-wrap">
            {data.metadata.complexity && (
              <Badge
                variant="secondary"
                className={cn('text-xs pointer-events-none', getComplexityColor(data.metadata.complexity))}
              >
                {data.metadata.complexity}
              </Badge>
            )}
            {data.metadata.confidence && (
              <Badge variant="outline" className="text-xs">
                {t('graph.node.confidence')}: {Math.round(data.metadata.confidence * 100)}%
              </Badge>
            )}
          </div>

          {/* Теги */}
          {data.metadata.tags && data.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.metadata.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {data.metadata.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{data.metadata.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Статистика */}
          <div className="flex justify-between text-xs opacity-70">
            <span>{t('common.created')}: {new Date(data.createdAt).toLocaleDateString(i18n.language)}</span>
            {(data.metadata.reviewCount ?? 0) > 0 && <span>{t('graph.node.reviews')}: {data.metadata.reviewCount}</span>}
          </div>
        </div>
      </div>
    </Card>
  )
})

KnowledgeNode.displayName = 'KnowledgeNode'
