import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge } from '@/entities/edge'
import type { Node } from '@/entities/node'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import { useConnectionFilter } from '../model/connection-filter.hooks'
import { ConnectionItem } from './connection-item'

interface NodeConnectionsPanelProps {
  node: Node
  edges: Edge[]
  allNodes: Node[]
  className?: string
}

export const NodeConnectionsPanel = memo(({ node, edges, allNodes, className }: NodeConnectionsPanelProps) => {
  const { t } = useTranslation()
  const { filter, changeFilter, filteredEdges, incomingCount, outgoingCount, totalCount } = useConnectionFilter(
    node.id,
    edges
  )

  const getNodeById = (id: string) => allNodes.find((n) => n.id === id)

  if (totalCount === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <p className="text-sm text-muted-foreground">{t('nodeDrawer.connections.noConnections')}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeFilter('all')}
          className="h-8 text-xs"
        >
          {t('nodeDrawer.connections.all')} ({totalCount})
        </Button>
        <Button
          variant={filter === 'incoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeFilter('incoming')}
          className="h-8 text-xs"
        >
          {t('nodeDrawer.connections.incoming')} ({incomingCount})
        </Button>
        <Button
          variant={filter === 'outgoing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeFilter('outgoing')}
          className="h-8 text-xs"
        >
          {t('nodeDrawer.connections.outgoing')} ({outgoingCount})
        </Button>
      </div>

      {/* Connections List */}
      <div className="space-y-2">
        {filteredEdges.map((edge) => {
          const isIncoming = edge.targetNodeId === node.id
          const connectedNodeId = isIncoming ? edge.sourceNodeId : edge.targetNodeId
          const connectedNode = getNodeById(connectedNodeId)

          if (!connectedNode) return null

          return (
            <ConnectionItem
              key={edge.id}
              edge={edge}
              node={connectedNode}
              direction={isIncoming ? 'incoming' : 'outgoing'}
            />
          )
        })}
      </div>
    </div>
  )
})

NodeConnectionsPanel.displayName = 'NodeConnectionsPanel'
