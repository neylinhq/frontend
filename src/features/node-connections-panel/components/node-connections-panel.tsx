import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useConnectionFilter } from '@/entities/edge'
import type { Edge } from '@/entities/edge'
import { getNodeIcon } from '@/entities/node'
import type { Node } from '@/entities/node'
import { cn } from '@/shared/lib/cn'
import { ConnectionItem } from '@/shared/ui/connection-item'

interface NodeConnectionsPanelProps {
  node: Node
  edges: Edge[]
  allNodes: Node[]
  className?: string
  onOpenNode?: (nodeId: string) => void
  onPanToNode?: (nodeId: string) => void
}

export const NodeConnectionsPanel = memo(
  ({ node, edges, allNodes, className, onOpenNode, onPanToNode }: NodeConnectionsPanelProps) => {
    const { t } = useTranslation()
    const { filter, changeFilter, filteredEdges, incomingCount, outgoingCount, totalCount } =
      useConnectionFilter(node.id, edges)

    // Create node lookup map for O(1) access
    const nodesMap = useMemo(() => new Map(allNodes.map(n => [n.id, n])), [allNodes])

    // Group edges by direction
    const { incomingEdges, outgoingEdges } = useMemo(() => {
      const incoming: Array<{ edge: Edge; node: Node }> = []
      const outgoing: Array<{ edge: Edge; node: Node }> = []

      for (const edge of filteredEdges) {
        const isIncoming = edge.targetNodeId === node.id
        const connectedNodeId = isIncoming ? edge.sourceNodeId : edge.targetNodeId
        const connectedNode = nodesMap.get(connectedNodeId)

        if (!connectedNode) continue

        if (isIncoming) {
          incoming.push({ edge, node: connectedNode })
        } else {
          outgoing.push({ edge, node: connectedNode })
        }
      }

      return { incomingEdges: incoming, outgoingEdges: outgoing }
    }, [filteredEdges, node.id, nodesMap])

    if (totalCount === 0) {
      return (
        <div className={cn('flex items-center justify-center py-12', className)}>
          <p className='text-sm text-muted-foreground'>
            {t('nodeDrawer.connections.noConnections')}
          </p>
        </div>
      )
    }

    return (
      <div className={cn('space-y-4', className)}>
        {/* Filter Pills */}
        <div className='flex gap-1.5 rounded-lg bg-muted/50 p-1 w-fit'>
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
        <div className='space-y-4'>
          {/* Incoming Section */}
          {incomingEdges.length > 0 && (
            <ConnectionSection
              title={t('nodeDrawer.connections.incoming')}
              count={incomingEdges.length}
              icon={<ArrowDownLeft className='h-3.5 w-3.5' />}
              color='blue'
              showHeader={filter === 'all'}
            >
              {incomingEdges.map(({ edge, node: connectedNode }) => {
                const NodeIcon = getNodeIcon(connectedNode.type)
                return (
                  <ConnectionItem
                    key={edge.id}
                    icon={<NodeIcon className='w-4 h-4 text-muted-foreground' />}
                    label={connectedNode.label}
                    subtitle={
                      <>
                        <span>{t(`graph.edgeTypes.${edge.relationType}`)}</span>
                        {edge.label && <span className='opacity-60'>· {edge.label}</span>}
                      </>
                    }
                    direction='incoming'
                    showDirectionHint={filter === 'all'}
                    onOpen={onOpenNode ? () => onOpenNode(connectedNode.id) : undefined}
                    onPanTo={onPanToNode ? () => onPanToNode(connectedNode.id) : undefined}
                  />
                )
              })}
            </ConnectionSection>
          )}

          {/* Outgoing Section */}
          {outgoingEdges.length > 0 && (
            <ConnectionSection
              title={t('nodeDrawer.connections.outgoing')}
              count={outgoingEdges.length}
              icon={<ArrowUpRight className='h-3.5 w-3.5' />}
              color='emerald'
              showHeader={filter === 'all'}
            >
              {outgoingEdges.map(({ edge, node: connectedNode }) => {
                const NodeIcon = getNodeIcon(connectedNode.type)
                return (
                  <ConnectionItem
                    key={edge.id}
                    icon={<NodeIcon className='w-4 h-4 text-muted-foreground' />}
                    label={connectedNode.label}
                    subtitle={
                      <>
                        <span>{t(`graph.edgeTypes.${edge.relationType}`)}</span>
                        {edge.label && <span className='opacity-60'>· {edge.label}</span>}
                      </>
                    }
                    direction='outgoing'
                    showDirectionHint={filter === 'all'}
                    onOpen={onOpenNode ? () => onOpenNode(connectedNode.id) : undefined}
                    onPanTo={onPanToNode ? () => onPanToNode(connectedNode.id) : undefined}
                  />
                )
              })}
            </ConnectionSection>
          )}
        </div>
      </div>
    )
  }
)

NodeConnectionsPanel.displayName = 'NodeConnectionsPanel'

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
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      <span className={cn('ml-1.5 tabular-nums', active ? 'text-muted-foreground' : 'opacity-60')}>
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

function ConnectionSection({
  title,
  count,
  icon,
  color,
  showHeader,
  children
}: ConnectionSectionProps) {
  return (
    <div>
      {showHeader && (
        <div className='mb-2 flex items-center gap-2 px-1'>
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded',
              color === 'blue'
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-emerald-500/10 text-emerald-500'
            )}
          >
            {icon}
          </span>
          <span className='text-xs font-medium text-muted-foreground'>{title}</span>
          <span className='tabular-nums text-xs text-muted-foreground/60'>({count})</span>
        </div>
      )}
      <div className='space-y-0.5'>{children}</div>
    </div>
  )
}
