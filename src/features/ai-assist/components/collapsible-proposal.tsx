import { ChevronDown, ChevronRight, Undo2 } from 'lucide-react'
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
  className?: string
}

export const CollapsibleProposal = ({
  preview,
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
        return t(`ai.fields.${data.field}`, data.field).toLowerCase()
      }
      case 'exercise': {
        const data = preview.data as ExercisePreviewData
        return (data.exercise?.type || t('ai.exercises.exercise', 'exercise')).toLowerCase()
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

        {/* Summary text */}
        <span className='flex-1 text-xs text-muted-foreground truncate'>
          {isApproved
            ? t('ai.proposals.applied', 'Applied ({{summary}})', { summary: getSummary() })
            : t('ai.proposals.dismissed', 'Dismissed ({{summary}})', { summary: getSummary() })}
        </span>

        {/* Undo/Restore button */}
        {onUndo && (
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
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className='px-3 py-2 border-t border-border bg-muted/30'>
          <ProposalContent preview={preview} />

          {/* Footer with undo/restore for expanded view */}
          {onUndo && (
            <div className='mt-3 pt-2 border-t border-border flex justify-end'>
              <Button size='sm' variant='outline' onClick={onUndo}>
                <Undo2 className='h-3.5 w-3.5 mr-1' />
                {isApproved ? t('common.undo', 'Undo') : t('common.restore', 'Restore')}
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
