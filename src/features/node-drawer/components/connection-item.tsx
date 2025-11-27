import { Eye, ExternalLink } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Edge, Node } from '@/entities/map'
import { getNodeIcon } from '@/features/graph-visualization/lib/get-node-style'
import { cn } from '@/shared/lib/cn'

interface ConnectionItemProps {
  edge: Edge
  node: Node
  direction: 'incoming' | 'outgoing'
  /** Hide direction indicator when grouped by direction */
  showDirectionHint?: boolean
  className?: string
  onOpenNode?: (nodeId: string) => void
  onPanToNode?: (nodeId: string) => void
}

export const ConnectionItem = memo(({
  edge,
  node,
  direction,
  showDirectionHint = true,
  className,
  onOpenNode,
  onPanToNode,
}: ConnectionItemProps) => {
  const { t } = useTranslation()
  const Icon = getNodeIcon(node.type)

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
        'group w-full text-left rounded-lg transition-all duration-150',
        'hover:bg-muted/60',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Node icon in subtle container */}
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0',
          'bg-muted/60 group-hover:bg-muted transition-colors'
        )}>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {node.label}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
            {showDirectionHint && (
              <span className={cn(
                'inline-block w-4 text-center',
                direction === 'incoming' ? 'text-blue-500' : 'text-emerald-500'
              )}>
                {direction === 'incoming' ? '←' : '→'}
              </span>
            )}
            <span>{t(`graph.edgeTypes.${edge.relationType}`)}</span>
            {edge.label && <span className="opacity-60">· {edge.label}</span>}
          </p>
        </div>

        {/* Actions - appear on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPanToNode && (
            <button
              type="button"
              onClick={handlePanClick}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                'text-muted-foreground hover:text-foreground hover:bg-background'
              )}
              title={t('nodeDrawer.connections.panToNode')}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenNode && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClick() }}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                'text-muted-foreground hover:text-foreground hover:bg-background'
              )}
              title={t('nodeDrawer.connections.openNode')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </button>
  )
})

ConnectionItem.displayName = 'ConnectionItem'
