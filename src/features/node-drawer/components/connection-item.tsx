import { ArrowDown, ArrowUp, Eye, ExternalLink } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { getNodeIcon } from '@/features/graph-visualization/lib/get-node-style'

interface ConnectionItemProps {
  edge: Edge
  node: Node
  direction: 'incoming' | 'outgoing'
  className?: string
  onOpenNode?: (nodeId: string) => void
  onPanToNode?: (nodeId: string) => void
}

export const ConnectionItem = memo(({
  edge,
  node,
  direction,
  className,
  onOpenNode,
  onPanToNode,
}: ConnectionItemProps) => {
  const { t } = useTranslation()
  const Icon = getNodeIcon(node.type)
  const DirectionIcon = direction === 'incoming' ? ArrowDown : ArrowUp

  const handleClick = () => {
    onOpenNode?.(node.id)
  }

  const handlePanClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPanToNode?.(node.id)
  }

  return (
    <button
      type="button"
      className={cn(
        'w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <DirectionIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <p className="font-medium text-sm truncate">{node.label}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t(`graph.edgeTypes.${edge.relationType}`)}
            {edge.label && ` • ${edge.label}`}
          </p>
        </div>
        {/* Action buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPanToNode && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handlePanClick}
              title={t('nodeDrawer.connections.panToNode', 'Go to node')}
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          )}
          {onOpenNode && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); handleClick() }}
              title={t('nodeDrawer.connections.openNode', 'Open node')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </button>
  )
})

ConnectionItem.displayName = 'ConnectionItem'
