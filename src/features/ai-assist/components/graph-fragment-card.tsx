import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, ChevronRight, Loader2, X, ArrowRight, GitBranch } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { Checkbox } from '@/shared/components/checkbox'
import { cn } from '@/shared/lib/cn'
import type { GraphFragmentPreviewData, GraphFragmentNode, GraphFragmentEdge } from '../model/ai-assist.types'

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

interface GraphFragmentCardProps {
  data: GraphFragmentPreviewData
  onApply: (selectedNodes: GraphFragmentNode[], selectedEdges: GraphFragmentEdge[]) => void
  onReject: () => void
  isLoading?: boolean
}

export const GraphFragmentCard = ({
  data,
  onApply,
  onReject,
  isLoading = false
}: GraphFragmentCardProps) => {
  const { t } = useTranslation()
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

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header - collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full px-3 py-2 bg-muted/50 border-b border-border',
          'flex items-center gap-2 text-left hover:bg-muted/70 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
        )}
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-xs font-medium flex-1 truncate">
          {data.title || t('ai.graphFragment.title', 'Graph Changes')}
        </span>
        <span className="text-xs text-muted-foreground">
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
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <div className="space-y-1.5">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('ai.graphFragment.nodes', 'Nodes')}
              </div>
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

          {/* Edges section */}
          {data.edges.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {t('ai.graphFragment.edges', 'Connections')}
              </div>
              {data.edges.map(edge => (
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
          )}

          {/* Reasoning */}
          {data.reasoning && (
            <div className="text-xs text-muted-foreground italic border-t border-border pt-2">
              {decodeHtmlEntities(data.reasoning)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-3 py-2 border-t border-border flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onReject}
          className="text-muted-foreground"
          disabled={isDisabled}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          {t('common.dismiss', 'Dismiss')}
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={isDisabled || noneSelected}
        >
          {isDisabled ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5 mr-1" />
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
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left cursor-pointer',
        'hover:bg-muted/50 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Checkbox checked={selected} />
      <span className="text-xs font-medium flex-1 truncate">{node.label}</span>
      <Badge
        variant="secondary"
        className={cn('text-[10px] font-medium', NODE_TYPE_COLORS[node.nodeType])}
      >
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

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left cursor-pointer',
        'hover:bg-muted/50 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
      title={!canSelect ? t('ai.graphFragment.edgeRequiresNodes', 'Select the connected nodes first') : undefined}
    >
      <Checkbox checked={selected && canSelect} />
      <span className={cn('text-xs truncate', edge.fromIsNew && 'text-primary')}>
        {getLabel(edge.fromRef, edge.fromIsNew)}
      </span>
      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      <Badge variant="outline" className="text-[10px] flex-shrink-0">
        {t(`graph.edgeTypes.${edge.relation}`, edge.relation)}
      </Badge>
      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      <span className={cn('text-xs truncate', edge.toIsNew && 'text-primary')}>
        {getLabel(edge.toRef, edge.toIsNew)}
      </span>
    </button>
  )
}


// TODO: DRY