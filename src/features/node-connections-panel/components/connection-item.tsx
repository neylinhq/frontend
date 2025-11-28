import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Edge } from '@/entities/edge'
import type { Node } from '@/entities/node'
import { getNodeIcon } from '@/features/graph-visualization/lib/get-node-style'
import { cn } from '@/shared/lib/cn'

interface ConnectionItemProps {
  edge: Edge
  node: Node
  direction: 'incoming' | 'outgoing'
  showDirectionHint?: boolean
  className?: string
}

export const ConnectionItem = memo(
  ({ edge, node, direction, showDirectionHint = true, className }: ConnectionItemProps) => {
    const { t } = useTranslation()
    const Icon = getNodeIcon(node.type)

    return (
      <div className={cn('rounded-lg transition-all duration-150 hover:bg-muted/60', className)}>
        <div className='flex items-center gap-3 px-3 py-2.5'>
          {/* Node icon */}
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted/60'>
            <Icon className='h-4 w-4 text-muted-foreground' />
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{node.label}</p>
            <p className='mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground'>
              {showDirectionHint && (
                <span
                  className={cn(
                    'inline-block w-4 text-center',
                    direction === 'incoming' ? 'text-blue-500' : 'text-emerald-500'
                  )}
                >
                  {direction === 'incoming' ? '←' : '→'}
                </span>
              )}
              <span>{t(`graph.edgeTypes.${edge.relationType}`)}</span>
              {edge.label && <span className='opacity-60'>· {edge.label}</span>}
            </p>
          </div>
        </div>
      </div>
    )
  }
)

ConnectionItem.displayName = 'ConnectionItem'
