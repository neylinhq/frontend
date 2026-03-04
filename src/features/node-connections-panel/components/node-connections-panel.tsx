import { ArrowDownLeftIcon, ArrowUpRightIcon } from '@untitledui/icons-react/outline'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Edge } from '@/entities/edge'
import { useConnectionFilter } from '@/entities/edge'
import type { Node } from '@/entities/node'
import { getNodeBgColor, getNodeIcon, getNodeTextColor } from '@/entities/node'
import { ConnectionItem } from '@/shared/components/connection-item'
import { SegmentedControl } from '@/shared/components/segmented-control'
import { cn } from '@/shared/lib/cn'

interface NodeConnectionsPanelProps {
  node: Node
  edges: Edge[]
  allNodes: Node[]
  className?: string
  onOpenNode?: (nodeId: string) => void
  onPanToNode?: (nodeId: string) => void
  onEditEdge?: (edge: Edge) => void
  onDeleteEdge?: (edgeId: string) => void
}

export const NodeConnectionsPanel = memo(
  ({
    node,
    edges,
    allNodes,
    className,
    onOpenNode,
    onPanToNode,
    onEditEdge,
    onDeleteEdge
  }: NodeConnectionsPanelProps) => {
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

        if (!connectedNode) {
          continue
        }

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
      <div className={cn('space-y-4 overflow-hidden', className)}>
        {/* Filter */}
        <SegmentedControl
          value={filter}
          onChange={changeFilter}
          options={[
            { value: 'all', label: t('nodeDrawer.connections.all'), count: totalCount },
            {
              value: 'incoming',
              label: t('nodeDrawer.connections.incoming'),
              count: incomingCount
            },
            { value: 'outgoing', label: t('nodeDrawer.connections.outgoing'), count: outgoingCount }
          ]}
          stretch
        />

        {/* Grouped connections list */}
        <div className='space-y-6'>
          {/* Incoming Section */}
          {incomingEdges.length > 0 && (
            <ConnectionSection
              title={t('nodeDrawer.connections.incoming')}
              count={incomingEdges.length}
              icon={<ArrowDownLeftIcon className='h-3.5 w-3.5' />}
              tone='info'
              showHeader={filter === 'all'}
            >
              {incomingEdges.map(({ edge, node: connectedNode }) => {
                const NodeIcon = getNodeIcon(connectedNode.type)
                const iconColor = getNodeTextColor(connectedNode.type)
                const iconBg = getNodeBgColor(connectedNode.type)
                return (
                  <ConnectionItem
                    key={edge.id}
                    icon={<NodeIcon className={cn('w-4 h-4', iconColor)} />}
                    iconContainerClassName={iconBg}
                    label={connectedNode.label}
                    subtitle={
                      <div className='flex min-w-0 items-center gap-1.5'>
                        <span className='shrink-0'>
                          {t(`graph.edgeTypes.${edge.relationType}`)}
                        </span>
                        {edge.label && <span className='shrink-0'>·</span>}
                        {edge.label && (
                          <span className='min-w-0 flex-1 truncate opacity-60'>{edge.label}</span>
                        )}
                      </div>
                    }
                    direction='incoming'
                    showDirectionHint={filter === 'all'}
                    onOpen={onOpenNode ? () => onOpenNode(connectedNode.id) : undefined}
                    onPanTo={onPanToNode ? () => onPanToNode(connectedNode.id) : undefined}
                    onEdit={onEditEdge ? () => onEditEdge(edge) : undefined}
                    onDelete={onDeleteEdge ? () => onDeleteEdge(edge.id) : undefined}
                    editTitle={t('common.edit')}
                    deleteTitle={t('common.remove')}
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
              icon={<ArrowUpRightIcon className='h-3.5 w-3.5' />}
              tone='success'
              showHeader={filter === 'all'}
            >
              {outgoingEdges.map(({ edge, node: connectedNode }) => {
                const NodeIcon = getNodeIcon(connectedNode.type)
                const iconColor = getNodeTextColor(connectedNode.type)
                const iconBg = getNodeBgColor(connectedNode.type)
                return (
                  <ConnectionItem
                    key={edge.id}
                    icon={<NodeIcon className={cn('w-4 h-4', iconColor)} />}
                    iconContainerClassName={iconBg}
                    label={connectedNode.label}
                    subtitle={
                      <div className='flex min-w-0 items-center gap-1.5'>
                        <span className='shrink-0'>
                          {t(`graph.edgeTypes.${edge.relationType}`)}
                        </span>
                        {edge.label && <span className='shrink-0'>·</span>}
                        {edge.label && (
                          <span className='min-w-0 flex-1 truncate opacity-60'>{edge.label}</span>
                        )}
                      </div>
                    }
                    direction='outgoing'
                    showDirectionHint={filter === 'all'}
                    onOpen={onOpenNode ? () => onOpenNode(connectedNode.id) : undefined}
                    onPanTo={onPanToNode ? () => onPanToNode(connectedNode.id) : undefined}
                    onEdit={onEditEdge ? () => onEditEdge(edge) : undefined}
                    onDelete={onDeleteEdge ? () => onDeleteEdge(edge.id) : undefined}
                    editTitle={t('common.edit')}
                    deleteTitle={t('common.remove')}
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
 * Connection Section
 * ───────────────────────────────────────────────────────────────────────────── */

interface ConnectionSectionProps {
  title: string
  count: number
  icon: React.ReactNode
  tone?: 'info' | 'success'
  showHeader: boolean
  children: React.ReactNode
}

const ConnectionSection = ({
  title,
  count,
  icon,
  tone,
  showHeader,
  children
}: ConnectionSectionProps) => {
  const toneClasses =
    tone === 'info'
      ? 'bg-info/10 text-info'
      : tone === 'success'
        ? 'bg-success/10 text-success'
        : 'bg-muted-foreground/10 text-muted-foreground'

  return (
    <div>
      {showHeader && (
        <div className='mb-3.5 flex items-center gap-2.5'>
          <span
            className={cn('flex h-5.5 w-5.5 items-center justify-center rounded-xs', toneClasses)}
          >
            {icon}
          </span>
          <div className='flex items-center gap-1.5'>
            <span className='text-xs font-medium text-muted-foreground'>{title}</span>
            <span className='tabular-nums text-xs text-muted-foreground/60'>({count})</span>
          </div>
        </div>
      )}
      <div className='space-y-3.5'>{children}</div>
    </div>
  )
}
