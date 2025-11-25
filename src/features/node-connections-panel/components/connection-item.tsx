import { ArrowLeft, ArrowRight } from 'lucide-react'
import { memo } from 'react'
import type { Edge } from '@/entities/edge'
import type { Node } from '@/entities/node'
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
    <div className={cn('rounded-lg border p-3 transition-colors hover:bg-muted/50', className)}>
      <div className="flex items-start gap-2">
        <DirectionIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 flex-shrink-0" />
            <p className="truncate text-sm font-medium">{node.label}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {edge.relationType}
            {edge.label && ` • ${edge.label}`}
          </p>
        </div>
      </div>
    </div>
  )
})

ConnectionItem.displayName = 'ConnectionItem'
