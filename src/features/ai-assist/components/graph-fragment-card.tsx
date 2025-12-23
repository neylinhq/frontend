import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, ChevronRightIcon, Loading02Icon, XCloseIcon } from '@untitledui/icons-react/outline'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { Checkbox } from '@/shared/components/checkbox'
import { cn } from '@/shared/lib/cn'
import type { GraphFragmentPreviewData, GraphFragmentNode, GraphFragmentEdge, PreviewStatus } from '../model/ai-assist.types'

/** Decode HTML entities like &#39; -> ' */
const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

/** Node type colors - using theme tokens from globals.css */
const NODE_TYPE_COLORS: Record<string, string> = {
  concept: 'bg-node-concept-muted text-node-concept',
  fact: 'bg-node-fact-muted text-node-fact',
  theory: 'bg-node-theory-muted text-node-theory',
  example: 'bg-node-example-muted text-node-example',
  question: 'bg-node-question-muted text-node-question',
  hypothesis: 'bg-node-hypothesis-muted text-node-hypothesis',
  person: 'bg-node-person-muted text-node-person',
  school: 'bg-node-school-muted text-node-school',
  term: 'bg-muted text-muted-foreground'
}

/**
 * Edge type colors - using theme tokens from globals.css
 * Color serves as mnemonic for relationship semantics
 */
const EDGE_TYPE_COLORS: Record<string, string> = {
  prerequisite: 'bg-edge-prerequisite-muted text-edge-prerequisite',
  causes: 'bg-edge-causes-muted text-edge-causes',
  explains: 'bg-edge-explains-muted text-edge-explains',
  'is-a': 'bg-edge-is-a-muted text-edge-is-a',
  'has-a': 'bg-edge-has-a-muted text-edge-has-a',
  'part-of': 'bg-edge-part-of-muted text-edge-part-of',
  influences: 'bg-edge-influences-muted text-edge-influences',
  'related-to': 'bg-edge-related-to-muted text-edge-related-to',
  contradicts: 'bg-edge-contradicts-muted text-edge-contradicts',
  'similar-to': 'bg-edge-similar-to-muted text-edge-similar-to'
}

const TAG_BASE_CLASSES = 'text-[10px] font-medium lowercase rounded-sm px-2 py-0.5'
type EdgeGroup = { key: string; label: string; isNew: boolean; edges: GraphFragmentEdge[] }

interface GraphFragmentCardProps {
  data: GraphFragmentPreviewData
  onApply: (selectedNodes: GraphFragmentNode[], selectedEdges: GraphFragmentEdge[]) => void
  onReject: () => void
  isLoading?: boolean
  /** Preview status - if approved/rejected, shows collapsed resolved state */
  status?: PreviewStatus
}

export const GraphFragmentCard = ({
  data,
  onApply,
  onReject,
  isLoading = false,
  status = 'pending'
}: GraphFragmentCardProps) => {
  const { t } = useTranslation()

  // Resolved state (approved/rejected) — always collapsed
  const isResolved = status === 'approved' || status === 'rejected'

  // Collapsed by default — progressive disclosure: user sees summary first, can expand if needed
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Combined loading state (external + internal)
  const isDisabled = isLoading || isApplying

  // Selection state - all selected by default
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(
    () => new Set(data.nodes.map(n => n.tempId))
  )
  const [selectedEdges, setSelectedEdges] = useState<Set<string>>(
    () => new Set(data.edges.map(e => e.tempId))
  )

  // Count selected items
  const selectedCount = selectedNodes.size + selectedEdges.size
  const totalCount = data.nodes.length + data.edges.length
  const allSelected = selectedCount === totalCount
  const noneSelected = selectedCount === 0

  // Toggle node selection
  const toggleNode = (tempId: string) => {
    setSelectedNodes(prev => {
      const next = new Set(prev)
      if (next.has(tempId)) {
        next.delete(tempId)
        // Also deselect edges that depend on this node
        data.edges.forEach(edge => {
          if ((edge.fromIsNew && edge.fromRef === tempId) ||
              (edge.toIsNew && edge.toRef === tempId)) {
            setSelectedEdges(e => {
              const nextE = new Set(e)
              nextE.delete(edge.tempId)
              return nextE
            })
          }
        })
      } else {
        next.add(tempId)
      }
      return next
    })
  }

  // Toggle edge selection
  const toggleEdge = (tempId: string) => {
    const edge = data.edges.find(e => e.tempId === tempId)
    if (!edge) return

    setSelectedEdges(prev => {
      const next = new Set(prev)
      if (next.has(tempId)) {
        next.delete(tempId)
      } else {
        // Can only select edge if its dependent nodes are selected
        const fromOk = !edge.fromIsNew || selectedNodes.has(edge.fromRef)
        const toOk = !edge.toIsNew || selectedNodes.has(edge.toRef)
        if (fromOk && toOk) {
          next.add(tempId)
        }
      }
      return next
    })
  }

  // Toggle all
  const toggleAll = () => {
    if (allSelected) {
      setSelectedNodes(new Set())
      setSelectedEdges(new Set())
    } else {
      setSelectedNodes(new Set(data.nodes.map(n => n.tempId)))
      setSelectedEdges(new Set(data.edges.map(e => e.tempId)))
    }
  }

  // Check if edge can be selected (its nodes must be selected)
  const canSelectEdge = (edge: GraphFragmentEdge): boolean => {
    const fromOk = !edge.fromIsNew || selectedNodes.has(edge.fromRef)
    const toOk = !edge.toIsNew || selectedNodes.has(edge.toRef)
    return fromOk && toOk
  }

  // Get display label for edge endpoint
  const getEdgeLabel = (ref: string, isNew: boolean): string => {
    if (isNew) {
      const node = data.nodes.find(n => n.tempId === ref)
      return node?.label || ref
    }
    return ref // Existing node label
  }

  const groupedEdges: EdgeGroup[] = (() => {
    const groups = new Map<string, EdgeGroup>()
    for (const edge of data.edges) {
      const label = getEdgeLabel(edge.fromRef, edge.fromIsNew)
      const key = `${edge.fromIsNew ? 'new' : 'existing'}:${label}`
      const group = groups.get(key)
      if (group) {
        group.edges.push(edge)
      } else {
        groups.set(key, { key, label, isNew: edge.fromIsNew, edges: [edge] })
      }
    }
    return Array.from(groups.values())
  })()

  // Handle apply with selected items
  const handleApply = () => {
    // Prevent double-click
    if (isApplying) return
    setIsApplying(true)

    const nodes = data.nodes.filter(n => selectedNodes.has(n.tempId))
    const edges = data.edges.filter(e => selectedEdges.has(e.tempId))
    onApply(nodes, edges)
    // Note: isApplying stays true - component will be unmounted after successful apply
  }

  // Summary for collapsed state
  const summary = useMemo(() => {
    const parts: string[] = []
    if (data.nodes.length > 0) {
      parts.push(t('ai.graphFragment.nodesCount', '{{count}} nodes', { count: data.nodes.length }))
    }
    if (data.edges.length > 0) {
      parts.push(t('ai.graphFragment.edgesCount', '{{count}} edges', { count: data.edges.length }))
    }
    return parts.join(', ')
  }, [data.nodes.length, data.edges.length, t])

  // For resolved state, show a simplified collapsed view
  if (isResolved) {
    return (
      <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/20 group">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full px-3 py-2',
            'flex items-center gap-2 text-left transition-colors',
            'bg-muted/30 hover:bg-muted/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            isExpanded && 'border-b border-border/60'
          )}
        >
          {/* Expand chevron */}
          <ChevronRightIcon
            className={cn(
              'h-3 w-3 text-muted-foreground/50 transition-transform duration-150 flex-shrink-0',
              'group-hover:text-muted-foreground',
              isExpanded && 'rotate-90'
            )}
          />

          {/* Summary */}
          <span className="text-[10px] text-muted-foreground flex-1 truncate">
            {summary}
          </span>

          {/* Status text */}
          <span className={cn(
            'text-[10px] flex-shrink-0',
            status === 'approved' ? 'text-muted-foreground/60' : 'text-muted-foreground/50'
          )}>
            {status === 'approved' ? t('ai.status.applied', 'Applied') : t('ai.status.skipped', 'Skipped')}
          </span>
        </button>

        {/* Expanded content for resolved state */}
        {isExpanded && (
          <div className="px-3 py-2.5 bg-background/60 rounded-b-lg space-y-2">
            {/* Nodes */}
            {data.nodes.length > 0 && (
              <div className="space-y-1.5">
                {data.nodes.map(node => (
                  <div key={node.tempId} className="flex items-center gap-1.5 text-xs">
                    <span className="font-medium truncate flex-1">{node.label}</span>
                    <Badge
                      variant="secondary"
                      className={cn(TAG_BASE_CLASSES, NODE_TYPE_COLORS[node.nodeType])}
                    >
                      {t(`nodeTypes.${node.nodeType}`, node.nodeType)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Separator */}
            {data.nodes.length > 0 && data.edges.length > 0 && (
              <div className="h-px bg-border" />
            )}

            {/* Edges */}
            {data.edges.length > 0 && (
              <div className="space-y-3">
                {groupedEdges.map(group => (
                  <div key={group.key} className="space-y-1">
                    <div className={cn(
                      'text-[11px] font-medium',
                      group.isNew ? 'text-primary' : 'text-foreground/80'
                    )}>
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.edges.map(edge => {
                        const toLabel = getEdgeLabel(edge.toRef, edge.toIsNew)
                        const edgeColorClasses = EDGE_TYPE_COLORS[edge.relation] ?? 'bg-muted text-muted-foreground'

                        return (
                          <div key={edge.tempId} className="flex items-center gap-2 text-xs">
                            <span className={cn('truncate flex-1', edge.toIsNew && 'text-primary')}>
                              {toLabel}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(TAG_BASE_CLASSES, 'flex-shrink-0', edgeColorClasses)}
                            >
                              {t(`graph.edgeTypes.${edge.relation}`, edge.relation)}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reasoning */}
          {data.reasoning && (
            <p className="text-xs text-muted-foreground italic border-t border-border/60 pt-2">
              {decodeHtmlEntities(data.reasoning)}
            </p>
          )}
          </div>
        )}
      </div>
    )
  }

  // Pending/editing state — full card with actions
  return (
    <div className="border border-border/60 rounded-lg overflow-hidden bg-card">
      {/* Header - collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full px-3 py-2 bg-muted/30',
          'flex items-center gap-2 text-left hover:bg-muted/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          isExpanded && 'border-b border-border/60'
        )}
      >
        <ChevronRightIcon
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-150',
            isExpanded && 'rotate-90'
          )}
        />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex-1 truncate">
          {data.title || t('ai.graphFragment.title', 'Graph Changes')}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {summary}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 py-2 space-y-3">
          {/* Select all toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Checkbox checked={allSelected} />
              <span>{t('ai.graphFragment.selectAll', 'Select all')}</span>
            </button>
            <span className="text-xs text-muted-foreground">
              {selectedCount}/{totalCount}
            </span>
          </div>

          {/* Nodes section */}
          {data.nodes.length > 0 && (
            <div className="space-y-1">
              {data.nodes.map(node => (
                <NodeRow
                  key={node.tempId}
                  node={node}
                  selected={selectedNodes.has(node.tempId)}
                  onToggle={() => toggleNode(node.tempId)}
                  disabled={isDisabled}
                />
              ))}
            </div>
          )}

          {/* Visual separator between sections */}
          {data.nodes.length > 0 && data.edges.length > 0 && (
            <div className="h-px bg-border" />
          )}

          {/* Edges section */}
          {data.edges.length > 0 && (
            <div className="space-y-3">
              {groupedEdges.map(group => (
                <div key={group.key} className="space-y-1">
                  <div className={cn(
                    'text-[11px] font-medium',
                    group.isNew ? 'text-primary' : 'text-foreground/80'
                  )}>
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.edges.map(edge => (
                      <EdgeRow
                        key={edge.tempId}
                        edge={edge}
                        selected={selectedEdges.has(edge.tempId)}
                        canSelect={canSelectEdge(edge)}
                        onToggle={() => toggleEdge(edge.tempId)}
                        getLabel={getEdgeLabel}
                        disabled={isDisabled}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reasoning */}
          {data.reasoning && (
            <div className="text-xs text-muted-foreground italic border-t border-border/60 pt-2">
              {decodeHtmlEntities(data.reasoning)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-3 py-2 border-t border-border/60 bg-muted/20 flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onReject}
          className="text-muted-foreground"
          disabled={isDisabled}
        >
          <XCloseIcon className="h-3.5 w-3.5 mr-1" />
          {t('common.dismiss', 'Dismiss')}
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={isDisabled || noneSelected}
        >
          {isDisabled ? (
            <Loading02Icon className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <CheckIcon className="h-3.5 w-3.5 mr-1" />
          )}
          {selectedCount === totalCount
            ? t('ai.graphFragment.applyAll', 'Apply All')
            : t('ai.graphFragment.applySelected', 'Apply ({{count}})', { count: selectedCount })}
        </Button>
      </div>
    </div>
  )
}

/** Single node row with checkbox */
interface NodeRowProps {
  node: GraphFragmentNode
  selected: boolean
  onToggle: () => void
  disabled?: boolean
}

const NodeRow = ({ node, selected, onToggle, disabled }: NodeRowProps) => {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-1.5 py-0.5 text-left cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Checkbox checked={selected} />
      <span className="text-xs font-medium flex-1 truncate">{node.label}</span>
      <Badge variant="secondary" className={cn(TAG_BASE_CLASSES, NODE_TYPE_COLORS[node.nodeType])}>
        {t(`nodeTypes.${node.nodeType}`, node.nodeType)}
      </Badge>
    </button>
  )
}

/** Single edge row with checkbox */
interface EdgeRowProps {
  edge: GraphFragmentEdge
  selected: boolean
  canSelect: boolean
  onToggle: () => void
  getLabel: (ref: string, isNew: boolean) => string
  disabled?: boolean
}

const EdgeRow = ({ edge, selected, canSelect, onToggle, getLabel, disabled }: EdgeRowProps) => {
  const { t } = useTranslation()
  const isDisabled = disabled || !canSelect

  // Get edge color classes with fallback for unknown types
  const edgeColorClasses = EDGE_TYPE_COLORS[edge.relation] ?? 'bg-muted text-muted-foreground'
  const toLabel = getLabel(edge.toRef, edge.toIsNew)

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-1.5 py-0.5 text-left cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
      title={!canSelect ? t('ai.graphFragment.edgeRequiresNodes', 'Select the connected nodes first') : undefined}
    >
      <Checkbox checked={selected && canSelect} />
      <span className={cn('text-xs truncate flex-1', edge.toIsNew && 'text-primary')}>
        {toLabel}
      </span>
      <Badge
        variant="secondary"
        className={cn(TAG_BASE_CLASSES, 'flex-shrink-0', edgeColorClasses)}
      >
        {t(`graph.edgeTypes.${edge.relation}`, edge.relation)}
      </Badge>
    </button>
  )
}


// TODO: DRY
