import { CheckIcon, ChevronRightIcon, XCloseIcon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib/cn'
import type {
  ConnectionPreviewData,
  EnrichmentPreviewData,
  ExercisePreviewData,
  GraphFragmentPreviewData,
  NewNodePreviewData,
  ResolvedPreview
} from '../model/ai-assist.types'
import { DiffBlock } from './proposal-card'

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
  school: 'bg-node-school-muted text-node-school'
}
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

const TAG_BASE_CLASSES = 'text-xs font-medium lowercase rounded-xs px-2 py-0.5 leading-tight'

interface CollapsibleProposalProps {
  preview: ResolvedPreview
  className?: string
}

export const CollapsibleProposal = ({
  preview,
  className
}: CollapsibleProposalProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const isApproved = preview.status === 'approved'

  // Get concise summary based on preview type
  const getSummary = (): string => {
    switch (preview.type) {
      case 'enrichment': {
        const data = preview.data as EnrichmentPreviewData
        const field = data.field || 'description'
        return t(`ai.fields.${field}`, field)
      }
      case 'exercise': {
        const data = preview.data as ExercisePreviewData
        return data.exercise?.type || t('ai.exercises.exercise', 'Exercise')
      }
      case 'new_node': {
        const data = preview.data as NewNodePreviewData
        return data.label
      }
      case 'connection': {
        const data = preview.data as ConnectionPreviewData
        return `${data.fromLabel} → ${data.toLabel}`
      }
      case 'graph_fragment': {
        const data = preview.data as GraphFragmentPreviewData
        const parts: string[] = []
        if (data.nodes?.length > 0) {
          parts.push(t('ai.graphFragment.nodesCount', '{{count}} nodes', { count: data.nodes.length }))
        }
        if (data.edges?.length > 0) {
          parts.push(t('ai.graphFragment.edgesCount', '{{count}} edges', { count: data.edges.length }))
        }
        return parts.join(', ') || t('ai.proposals.change', 'Change')
      }
      case 'edge':
        return t('ai.proposals.newEdge', 'Connection')
      case 'node':
        return t('ai.proposals.newNode', 'Node')
      default:
        return t('ai.proposals.change', 'Change')
    }
  }

  return (
    <div className={cn('rounded-lg overflow-hidden border border-border/60 bg-muted/20', className)}>
      {/* Header row */}
      <div
        role='button'
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
        className={cn(
          'group w-full px-3 py-2 flex items-center gap-2 text-left cursor-pointer',
          'bg-muted/30 hover:bg-muted/40 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          isExpanded && 'border-b border-border/60'
        )}
      >
        {/* Status icon */}
        <div
          className={cn(
            'flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center',
            isApproved
              ? 'bg-success/15 text-success'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isApproved ? (
            <CheckIcon className='h-2.5 w-2.5' strokeWidth={3} />
          ) : (
            <XCloseIcon className='h-2.5 w-2.5' strokeWidth={3} />
          )}
        </div>

        {/* Summary text */}
        <span className='flex-1 text-xs text-muted-foreground truncate'>
          {getSummary()}
        </span>

        {/* Status text */}
        <span
          className={cn(
            'text-xs flex-shrink-0',
            isApproved ? 'text-muted-foreground/60' : 'text-muted-foreground/50'
          )}
        >
          {isApproved ? t('ai.status.applied', 'Applied') : t('ai.status.skipped', 'Skipped')}
        </span>

        {/* Expand chevron */}
        <ChevronRightIcon
          className={cn(
            'h-3 w-3 text-muted-foreground/50 transition-transform duration-150 flex-shrink-0',
            'group-hover:text-muted-foreground',
            isExpanded && 'rotate-90'
          )}
        />
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className='px-3 py-2.5'>
          <ProposalContent preview={preview} />
        </div>
      )}
    </div>
  )
}

/** Render the content based on preview type */
const ProposalContent = ({ preview }: { preview: ResolvedPreview }) => {
  const { t } = useTranslation()

  switch (preview.type) {
    case 'enrichment': {
      const data = preview.data as EnrichmentPreviewData
      return (
        <div className='space-y-2'>
          <div className='text-xs font-medium text-muted-foreground'>
            {t(`ai.fields.${data.field}`, data.field)}
          </div>
          <DiffBlock
            current={data.current}
            proposed={data.proposed}
            className='text-xs'
            renderHtml
          />
        </div>
      )
    }

    case 'exercise': {
      const data = preview.data as ExercisePreviewData
      const exercise = data.exercise
      return (
        <div className='space-y-2 text-xs'>
          <div className='font-medium'>{exercise?.question}</div>
          {exercise?.options && (
            <ul className='list-disc list-inside text-muted-foreground'>
              {exercise.options.map(opt => (
                <li key={opt.id}>{opt.content}</li>
              ))}
            </ul>
          )}
        </div>
      )
    }

    case 'new_node': {
      const data = preview.data as NewNodePreviewData
      return (
        <div className='space-y-2 text-xs'>
          <div className='flex items-center justify-between gap-2'>
            <span className='font-medium'>{data.label}</span>
            <Badge
              variant='secondary'
              className={cn(TAG_BASE_CLASSES, NODE_TYPE_COLORS[data.nodeType])}
            >
              {t(`nodeTypes.${data.nodeType}`, data.nodeType)}
            </Badge>
          </div>
          {data.description && (
            <p className='text-muted-foreground'>{data.description}</p>
          )}
          {data.connectTo && data.connectTo.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {data.connectTo.map((conn, i) => (
                <Badge key={i} variant='outline' className='text-xs'>
                  → {conn.nodeLabel} ({t(`graph.edgeTypes.${conn.relation}`, conn.relation)})
                </Badge>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'connection': {
      const data = preview.data as ConnectionPreviewData
      return (
        <div className='space-y-2 text-xs'>
          <div className='flex items-center justify-between gap-2'>
            <span className='font-medium'>
              {data.fromLabel} → {data.toLabel}
            </span>
            <Badge variant='outline' className='text-xs'>
              {t(`graph.edgeTypes.${data.relation}`, data.relation)}
            </Badge>
          </div>
          {data.reasoning && <p className='text-muted-foreground italic'>{data.reasoning}</p>}
        </div>
      )
    }

    case 'graph_fragment': {
      const data = preview.data as GraphFragmentPreviewData
      const getEdgeLabel = (ref: string, isNew: boolean) => {
        if (isNew) {
          return data.nodes?.find(n => n.tempId === ref)?.label || ref
        }
        return ref
      }
      const groupedEdges = (() => {
        const groups = new Map<
          string,
          { key: string; label: string; isNew: boolean; edges: GraphFragmentPreviewData['edges'] }
        >()
        for (const edge of data.edges ?? []) {
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
      return (
        <div className='space-y-2 text-xs'>
          {/* Nodes */}
          {data.nodes && data.nodes.length > 0 && (
            <div className='space-y-1'>
              {data.nodes.map((node, i) => (
                <div key={node.tempId || i} className='flex items-center justify-between gap-2'>
                  <span className='font-medium'>{node.label}</span>
                  <Badge
                    variant='secondary'
                    className={cn(TAG_BASE_CLASSES, NODE_TYPE_COLORS[node.nodeType])}
                  >
                    {t(`nodeTypes.${node.nodeType}`, node.nodeType)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          {data.nodes && data.nodes.length > 0 && data.edges && data.edges.length > 0 && (
            <div className='h-px bg-border' />
          )}
          {/* Edges */}
          {data.edges && data.edges.length > 0 && (
            <div className='space-y-3'>
              {groupedEdges.map(group => (
                <div key={group.key} className='space-y-1.5'>
                  <div className='text-xs font-medium text-foreground/70'>
                    {group.label}
                  </div>
                  <div className='space-y-1'>
                    {group.edges.map((edge, index) => {
                      const toLabel = getEdgeLabel(edge.toRef, edge.toIsNew)
                      const edgeColorClasses = EDGE_TYPE_COLORS[edge.relation] ?? 'bg-muted text-muted-foreground'
                      const edgeKey = edge.tempId || `${edge.fromRef}-${edge.toRef}-${edge.relation}-${index}`

                      return (
                        <div key={edgeKey} className='flex items-center gap-2 text-xs'>
                          <span className={cn('truncate flex-1', edge.toIsNew && 'text-primary')}>
                            {toLabel}
                          </span>
                          <Badge
                            variant='secondary'
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
          {data.reasoning && (
            <p className='text-muted-foreground italic border-t border-border pt-2'>{decodeHtmlEntities(data.reasoning)}</p>
          )}
        </div>
      )
    }

    case 'edge':
    case 'node':
      return (
        <div className='text-xs text-muted-foreground'>
          <pre className='whitespace-pre-wrap'>{JSON.stringify(preview.data, null, 2)}</pre>
        </div>
      )

    default:
      return null
  }
}
