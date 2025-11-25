import { ArrowLeft, ArrowRight } from 'lucide-react'
import { memo } from 'react'
import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { getNodeIcon } from '@/features/graph-visualization/lib/get-node-style'

interface ConnectionItemProps {
  edge: Edge
  node: Node
  direction: 'incoming' | 'outgoing'
  className?: string
}

export const ConnectionItem = memo(({ edge, node, direction, className }: ConnectionItemProps) => {
  const Icon = getNodeIcon(node.type)
  const DirectionIcon = direction === 'incoming' ? ArrowLeft : ArrowRight

  return (
    <div className={cn('p-3 border rounded-lg hover:bg-muted/50 transition-colors', className)}>
      <div className="flex items-start gap-2">
        <DirectionIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <p className="font-medium text-sm truncate">{node.label}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {edge.relationType}
            {edge.label && ` • ${edge.label}`}
          </p>
        </div>
      </div>
    </div>
  )
})

ConnectionItem.displayName = 'ConnectionItem'
