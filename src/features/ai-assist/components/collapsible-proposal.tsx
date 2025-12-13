import { Check, ChevronDown, ChevronRight, Undo2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'
import type {
  EnrichmentPreviewData,
  ExercisePreviewData,
  ResolvedPreview
} from '../model/ai-assist.types'
import { DiffBlock } from './proposal-card'

interface CollapsibleProposalProps {
  preview: ResolvedPreview
  onUndo?: () => void
  canUndo?: boolean
  className?: string
}

export const CollapsibleProposal = ({
  preview,
  onUndo,
  canUndo = true,
  className
}: CollapsibleProposalProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const isApproved = preview.status === 'approved'
  const StatusIcon = isApproved ? Check : X

  // Get summary based on preview type
  const getSummary = (): string => {
    switch (preview.type) {
      case 'enrichment': {
        const data = preview.data as EnrichmentPreviewData
        return t(`ai.fields.${data.field}`, data.field)
      }
      case 'exercise': {
        const data = preview.data as ExercisePreviewData
        return data.exercise?.type || t('ai.exercises.exercise', 'Exercise')
      }
      case 'edge':
        return t('ai.proposals.newEdge', 'New connection')
      case 'node':
        return t('ai.proposals.newNode', 'New node')
      default:
        return t('ai.proposals.change', 'Change')
    }
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-card/50', className)}>
      {/* Collapsed header - always visible */}
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full px-3 py-2 flex items-center gap-2 text-left',
          'hover:bg-muted/50 transition-colors'
        )}
      >
        {/* Expand/collapse chevron */}
        {isExpanded ? (
          <ChevronDown className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
        ) : (
          <ChevronRight className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
        )}

        {/* Status icon */}
        <StatusIcon
          className={cn(
            'h-3.5 w-3.5 flex-shrink-0',
            isApproved ? 'text-green-600' : 'text-muted-foreground'
          )}
        />

        {/* Summary text */}
        <span className='flex-1 text-xs text-muted-foreground truncate'>
          {isApproved
            ? t('ai.proposals.applied', 'Applied: {{summary}}', { summary: getSummary() })
            : t('ai.proposals.dismissed', 'Dismissed: {{summary}}', { summary: getSummary() })}
        </span>

        {/* Undo button - only show if canUndo and approved */}
        {canUndo && onUndo && isApproved && (
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
            {t('common.undo', 'Undo')}
          </Button>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className='px-3 py-2 border-t border-border bg-muted/30'>
          <ProposalContent preview={preview} />

          {/* Footer with undo for expanded view */}
          {canUndo && onUndo && isApproved && (
            <div className='mt-3 pt-2 border-t border-border flex justify-end'>
              <Button size='sm' variant='outline' onClick={onUndo}>
                <Undo2 className='h-3.5 w-3.5 mr-1' />
                {t('common.undo', 'Undo')}
              </Button>
            </div>
          )}
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
