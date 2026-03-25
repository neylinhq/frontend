import { CheckIcon, Loading02Icon, Pencil01Icon, XCloseIcon } from '@untitledui/icons-react/outline'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { RichMarkdown } from '@/shared/components/rich-markdown'
import { cn } from '@/shared/lib/cn'
import { sanitizeHtml } from '@/shared/lib/sanitize'

/** Prose styles for consistent markdown rendering */
const proseClasses =
  'prose prose-sm dark:prose-invert max-w-none prose-p:my-0.5 prose-headings:my-1 prose-ul:my-0.5 prose-li:my-0'

interface ProposalCardProps {
  /** Header title */
  title: string
  /** Content slot */
  children: ReactNode
  /** Called when user accepts the proposal */
  onAccept: () => void
  /** Called when user rejects/dismisses the proposal */
  onReject: () => void
  /** Called when user wants to edit (optional) */
  onEdit?: () => void
  /** Visual variant */
  variant?: 'default' | 'compact'
  /** Additional class names */
  className?: string
  /** Loading state - disables buttons and shows spinner */
  isLoading?: boolean
}

export const ProposalCard = ({
  title,
  children,
  onAccept,
  onReject,
  onEdit,
  variant = 'default',
  className,
  isLoading = false
}: ProposalCardProps) => {
  const { t } = useTranslation()

  return (
    <div className={cn('border border-border/60 rounded-lg overflow-hidden bg-card', className)}>
      {/* Header */}
      <div className='px-3 py-2 bg-muted/30 border-b border-border/60'>
        <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          {title}
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          'text-sm leading-relaxed',
          variant === 'compact' ? 'px-3 py-2.5' : 'px-3 py-3'
        )}
      >
        {children}
      </div>

      {/* Actions */}
      <div className='px-3 py-2 border-t border-border/60 bg-muted/20 flex justify-end gap-2'>
        <Button
          size='sm'
          variant='ghost'
          onClick={onReject}
          className='text-muted-foreground'
          disabled={isLoading}
        >
          <XCloseIcon className='h-3.5 w-3.5 mr-1' />
          {t('common.dismiss', 'Dismiss')}
        </Button>
        {onEdit && (
          <Button size='sm' variant='outline' onClick={onEdit} disabled={isLoading}>
            <Pencil01Icon className='h-3.5 w-3.5 mr-1' />
            {t('common.edit', 'Edit')}
          </Button>
        )}
        <Button size='sm' onClick={onAccept} disabled={isLoading}>
          {isLoading ? (
            <Loading02Icon className='h-3.5 w-3.5 mr-1 animate-spin' />
          ) : (
            <CheckIcon className='h-3.5 w-3.5 mr-1' />
          )}
          {t('common.apply', 'Apply')}
        </Button>
      </div>
    </div>
  )
}

/** Diff line component for showing changes */
interface DiffLineProps {
  type: 'add' | 'remove'
  children: ReactNode
  className?: string
}

export const DiffLine = ({ type, children, className }: DiffLineProps) => (
  <div className={cn('flex gap-2 items-start', className)}>
    <span
      className={cn(
        'flex-shrink-0 w-4 text-center font-mono text-xs leading-5',
        type === 'remove' ? 'text-destructive/70' : 'text-success'
      )}
    >
      {type === 'remove' ? '−' : '+'}
    </span>
    <span
      className={cn('flex-1 min-w-0', type === 'remove' && 'line-through text-muted-foreground')}
    >
      {children}
    </span>
  </div>
)

/** Diff block for showing before/after changes */
interface DiffBlockProps {
  current?: string | null
  proposed: string
  className?: string
  /** Render content as rich text (parses markdown to HTML) */
  renderHtml?: boolean
}

export const DiffBlock = ({ current, proposed, className, renderHtml }: DiffBlockProps) => {
  // Sanitize current HTML (from storage) for safe rendering
  const currentHtml = useMemo(
    () => (current && renderHtml ? sanitizeHtml(current) : null),
    [current, renderHtml]
  )

  return (
    <div className={cn('space-y-1', className)}>
      {current && (
        <DiffLine type='remove'>
          {currentHtml ? (
            <div className={proseClasses} dangerouslySetInnerHTML={{ __html: currentHtml }} />
          ) : (
            current
          )}
        </DiffLine>
      )}
      <DiffLine type='add'>
        {renderHtml ? (
          <div className={proseClasses}>
            <RichMarkdown>{proposed}</RichMarkdown>
          </div>
        ) : (
          proposed
        )}
      </DiffLine>
    </div>
  )
}
