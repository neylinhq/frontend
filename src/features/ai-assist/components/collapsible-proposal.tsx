import { ChevronDown, ChevronRight, Undo2 } from 'lucide-react'

/** Decode HTML entities like &#39; -> ' */
const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
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

interface CollapsibleProposalProps {
  preview: ResolvedPreview
  canUndo?: boolean
  onUndo?: () => void
  className?: string
}

export const CollapsibleProposal = ({
  preview,
  canUndo,
  onUndo,
  className
}: CollapsibleProposalProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const isApproved = preview.status === 'approved'

  // Get summary based on preview type (lowercase for parenthetical display)
  const getSummary = (): string => {
    switch (preview.type) {
      case 'enrichment': {
        const data = preview.data as EnrichmentPreviewData
        const field = data.field || 'description'
        return t(`ai.fields.${field}`, field).toLowerCase()
      }
      case 'exercise': {
        const data = preview.data as ExercisePreviewData
        return (data.exercise?.type || t('ai.exercises.exercise', 'exercise')).toLowerCase()
      }
      case 'new_node': {
        const data = preview.data as NewNodePreviewData
        return `${t('ai.proposals.newNode', 'node')}: ${data.label}`.toLowerCase()
      }
      case 'connection': {
        const data = preview.data as ConnectionPreviewData
        return `${data.fromLabel} → ${data.toLabel}`.toLowerCase()
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
        return parts.join(', ').toLowerCase() || t('ai.proposals.change', 'change').toLowerCase()
      }
      case 'edge':
        return t('ai.proposals.newEdge', 'connection').toLowerCase()
      case 'node':
        return t('ai.proposals.newNode', 'node').toLowerCase()
      default:
        return t('ai.proposals.change', 'change').toLowerCase()
    }
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-card/50', className)}>
      {/* Collapsed header - always visible */}
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
          'w-full px-3 py-2 flex items-center gap-2 text-left cursor-pointer',
          'hover:bg-muted/50 transition-colors'
        )}
      >
        {/* Expand/collapse chevron */}
        {isExpanded ? (
          <ChevronDown className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
        ) : (
          <ChevronRight className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
        )}

        {/* Summary text */}
        <span className='flex-1 text-xs text-muted-foreground truncate'>
          {isApproved
            ? t('ai.proposals.applied', 'Applied ({{summary}})', { summary: getSummary() })
            : t('ai.proposals.dismissed', 'Dismissed ({{summary}})', { summary: getSummary() })}
        </span>

        {/* Undo/Restore button - only show if canUndo is true or status is rejected (restore) */}
        {onUndo && (canUndo || !isApproved) && (
          <Button
            size='sm'
            variant='ghost'
            onClick={e => {
              e.stopPropagation()
              onUndo()
            }}
            className='h-6 px-2 text-xs text-muted-foreground hover:text-foreground'
          >
            <Undo2 className='h-3 w-3 mr-1' />
            {isApproved ? t('common.undo', 'Undo') : t('common.restore', 'Restore')}
          </Button>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className='px-3 py-2 border-t border-border bg-muted/30'>
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
              className={cn('text-xs font-medium', NODE_TYPE_COLORS[data.nodeType])}
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
      return (
        <div className='space-y-2 text-xs'>
          {/* Nodes */}
          {data.nodes && data.nodes.length > 0 && (
            <div className='space-y-1'>
              <div className='text-[10px] font-medium text-muted-foreground tracking-wide'>
                {t('ai.graphFragment.nodes', 'Nodes')}
              </div>
              {data.nodes.map((node, i) => (
                <div key={node.tempId || i} className='flex items-center justify-between gap-2'>
                  <span className='font-medium'>{node.label}</span>
                  <Badge
                    variant='secondary'
                    className={cn('text-[10px] font-medium', NODE_TYPE_COLORS[node.nodeType])}
                  >
                    {t(`nodeTypes.${node.nodeType}`, node.nodeType)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          {/* Edges */}
          {data.edges && data.edges.length > 0 && (
            <div className='space-y-1'>
              <div className='text-[10px] font-medium text-muted-foreground tracking-wide'>
                {t('ai.graphFragment.edges', 'Connections')}
              </div>
              {data.edges.map((edge, i) => {
                const fromLabel = edge.fromIsNew
                  ? data.nodes?.find(n => n.tempId === edge.fromRef)?.label || edge.fromRef
                  : edge.fromRef
                const toLabel = edge.toIsNew
                  ? data.nodes?.find(n => n.tempId === edge.toRef)?.label || edge.toRef
                  : edge.toRef
                return (
                  <div key={edge.tempId || i} className='flex items-center gap-2 pl-2'>
                    <span>{fromLabel}</span>
                    <span className='text-muted-foreground'>→</span>
                    <Badge variant='outline' className='text-[10px]'>
                      {t(`graph.edgeTypes.${edge.relation}`, edge.relation)}
                    </Badge>
                    <span className='text-muted-foreground'>→</span>
                    <span>{toLabel}</span>
                  </div>
                )
              })}
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
