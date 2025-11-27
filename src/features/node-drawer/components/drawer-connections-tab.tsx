import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { useConnectionFilter } from '../model/connection-filter.hooks'
import { ConnectionItem } from './connection-item'

interface DrawerConnectionsTabProps {
  node: Node
  edges: Edge[]
  allNodes: Node[]
  className?: string
  onOpenNode?: (nodeId: string) => void
  onPanToNode?: (nodeId: string) => void
}

export const DrawerConnectionsTab = memo(({
  node,
  edges,
  allNodes,
  className,
  onOpenNode,
  onPanToNode,
}: DrawerConnectionsTabProps) => {
  const { t } = useTranslation()
  const { filter, changeFilter, filteredEdges, incomingCount, outgoingCount, totalCount } = useConnectionFilter(
    node.id,
    edges
  )

  // Group edges by direction
  const { incomingEdges, outgoingEdges } = useMemo(() => {
    const incoming: Array<{ edge: Edge; node: Node }> = []
    const outgoing: Array<{ edge: Edge; node: Node }> = []

    for (const edge of filteredEdges) {
      const isIncoming = edge.targetNodeId === node.id
      const connectedNodeId = isIncoming ? edge.sourceNodeId : edge.targetNodeId
      const connectedNode = allNodes.find(n => n.id === connectedNodeId)

      if (!connectedNode) continue

      if (isIncoming) {
        incoming.push({ edge, node: connectedNode })
      } else {
        outgoing.push({ edge, node: connectedNode })
      }
    }

    return { incomingEdges: incoming, outgoingEdges: outgoing }
  }, [filteredEdges, node.id, allNodes])

  if (totalCount === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <p className="text-sm text-muted-foreground">{t('nodeDrawer.connections.noConnections')}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Pills */}
      <div className="flex gap-1.5 p-1 bg-muted/50 rounded-lg w-fit">
        <FilterPill
          active={filter === 'all'}
          onClick={() => changeFilter('all')}
          label={t('nodeDrawer.connections.all')}
          count={totalCount}
        />
        <FilterPill
          active={filter === 'incoming'}
          onClick={() => changeFilter('incoming')}
          label={t('nodeDrawer.connections.incoming')}
          count={incomingCount}
        />
        <FilterPill
          active={filter === 'outgoing'}
          onClick={() => changeFilter('outgoing')}
          label={t('nodeDrawer.connections.outgoing')}
          count={outgoingCount}
        />
      </div>

      {/* Grouped connections list */}
      <div className="space-y-4">
        {/* Incoming Section */}
        {incomingEdges.length > 0 && (
          <ConnectionSection
            title={t('nodeDrawer.connections.incoming')}
            count={incomingEdges.length}
            icon={<ArrowDownLeft className="w-3.5 h-3.5" />}
            color="blue"
            showHeader={filter === 'all'}
          >
            {incomingEdges.map(({ edge, node: connectedNode }) => (
              <ConnectionItem
                key={edge.id}
                edge={edge}
                node={connectedNode}
                direction="incoming"
                showDirectionHint={filter === 'all'}
                onOpenNode={onOpenNode}
                onPanToNode={onPanToNode}
              />
            ))}
          </ConnectionSection>
        )}

        {/* Outgoing Section */}
        {outgoingEdges.length > 0 && (
          <ConnectionSection
            title={t('nodeDrawer.connections.outgoing')}
            count={outgoingEdges.length}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            color="emerald"
            showHeader={filter === 'all'}
          >
            {outgoingEdges.map(({ edge, node: connectedNode }) => (
              <ConnectionItem
                key={edge.id}
                edge={edge}
                node={connectedNode}
                direction="outgoing"
                showDirectionHint={filter === 'all'}
                onOpenNode={onOpenNode}
                onPanToNode={onPanToNode}
              />
            ))}
          </ConnectionSection>
        )}
      </div>
    </div>
  )
})

DrawerConnectionsTab.displayName = 'DrawerConnectionsTab'

/* ─────────────────────────────────────────────────────────────────────────────
 * Filter Pill
 * ───────────────────────────────────────────────────────────────────────────── */

interface FilterPillProps {
  active: boolean
  onClick: () => void
  label: string
  count: number
}

function FilterPill({ active, onClick, label, count }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      <span className={cn(
        'ml-1.5 tabular-nums',
        active ? 'text-muted-foreground' : 'opacity-60'
      )}>
        {count}
      </span>
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Connection Section
 * ───────────────────────────────────────────────────────────────────────────── */

interface ConnectionSectionProps {
  title: string
  count: number
  icon: React.ReactNode
  color: 'blue' | 'emerald'
  showHeader: boolean
  children: React.ReactNode
}

function ConnectionSection({ title, count, icon, color, showHeader, children }: ConnectionSectionProps) {
  return (
    <div>
      {showHeader && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className={cn(
            'flex items-center justify-center w-5 h-5 rounded',
            color === 'blue' ? 'text-blue-500 bg-blue-500/10' : 'text-emerald-500 bg-emerald-500/10'
          )}>
            {icon}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {title}
          </span>
          <span className="text-xs text-muted-foreground/60 tabular-nums">
            ({count})
          </span>
        </div>
      )}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  )
}
