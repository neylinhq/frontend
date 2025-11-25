import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@/entities/map'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import type { ConnectionFilterType } from '../model/connection-filter.hooks'
import { useConnectionFilter } from '../model/connection-filter.hooks'
import { ConnectionItem } from './connection-item'

interface DrawerConnectionsTabProps {
  node: Node
  edges: Edge[]
  allNodes: Node[]
  className?: string
}

export const DrawerConnectionsTab = memo(({ node, edges, allNodes, className }: DrawerConnectionsTabProps) => {
  const { t } = useTranslation()
  const { filter, changeFilter, filteredEdges, incomingCount, outgoingCount, totalCount } = useConnectionFilter(
    node.id,
    edges
  )

  const getNodeById = (id: string) => allNodes.find(n => n.id === id)

  if (totalCount === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <p className="text-sm text-muted-foreground">{t('nodeDrawer.connections.noConnections')}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Фильтр */}
      <div className="flex gap-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => changeFilter('all')}
          label={`${t('nodeDrawer.connections.all')} (${totalCount})`}
        />
        <FilterButton
          active={filter === 'incoming'}
          onClick={() => changeFilter('incoming')}
          label={`${t('nodeDrawer.connections.incoming')} (${incomingCount})`}
        />
        <FilterButton
          active={filter === 'outgoing'}
          onClick={() => changeFilter('outgoing')}
          label={`${t('nodeDrawer.connections.outgoing')} (${outgoingCount})`}
        />
      </div>

      {/* Список связей */}
      <div className="space-y-2">
        {filteredEdges.map(edge => {
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

DrawerConnectionsTab.displayName = 'DrawerConnectionsTab'

// Вспомогательный компонент для кнопок фильтра
interface FilterButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function FilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="text-xs h-8"
    >
      {label}
    </Button>
  )
}
