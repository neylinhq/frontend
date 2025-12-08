import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge } from '@/entities/edge'
import { useConnectionFilter } from '@/entities/edge'
import type { Node } from '@/entities/node'
import { getNodeIcon } from '@/entities/node'
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
  ({ node, edges, allNodes, className, onOpenNode, onPanToNode, onEditEdge, onDeleteEdge }: NodeConnectionsPanelProps) => {
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
      <div className={cn('space-y-4', className)}>
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
        />

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
  color: 'blue' | 'emerald'
  showHeader: boolean
  children: React.ReactNode
}

const ConnectionSection = ({
  title,
  count,
  icon,
  color,
  showHeader,
  children
}: ConnectionSectionProps) => {
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
