import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'
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

export const KnowledgeNode = memo(({ data }: KnowledgeNodeProps) => {
  const Icon = getNodeIcon(data.type)
  const isSelected = data.selected
  const isDimmed = data.isDimmed
  const isFocused = data.isFocused

  return (
    <Card
      className={cn(
        'min-w-[220px] max-w-[280px] cursor-grab active:cursor-grabbing',
        'bg-card border-r border-t border-b border-border',
        'border-l-[3px]',
        getNodeBorderColor(data.type),
        'transition-all duration-200 hover:shadow-sm',
        // Dimmed state - reduced opacity
        isDimmed && 'opacity-40',
        // Focused state - pulsing glow (indigo on light, white on dark)
        isFocused && 'animate-glow-pulse',
        // Selected state
        isSelected && !isFocused && 'ring-2 ring-primary shadow-lg'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-border border-2 border-background"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-border border-2 border-background"
      />

      <div className="p-6">
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-2">
          <Icon className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
          <h3 className="text-lg font-semibold leading-tight break-words">{data.label}</h3>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{data.description}</p>
        )}

        {/* Complexity badge (optional) */}
        {data.metadata.complexity && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs mt-3 pointer-events-none',
              getComplexityColor(data.metadata.complexity)
            )}
          >
            {data.metadata.complexity}
          </Badge>
        )}
      </div>
    </Card>
  )
})

KnowledgeNode.displayName = 'KnowledgeNode'
