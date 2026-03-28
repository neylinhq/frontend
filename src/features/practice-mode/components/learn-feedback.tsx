import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

interface LearnFeedbackProps {
  isCorrect: boolean
  feedback: string
  explanation?: string
  stabilityBefore: number
  stabilityAfter: number
  overconfident?: boolean
  onNext: () => void
}

export const LearnFeedback = ({
  isCorrect,
  feedback,
  explanation,
  stabilityBefore,
  stabilityAfter,
  overconfident,
  onNext,
}: LearnFeedbackProps) => {
  const { t } = useTranslation()
  const delta = stabilityAfter - stabilityBefore
  const deltaText = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}d`

  return (
    <div className='space-y-3'>
      <div className={cn(
        'flex items-center gap-2 text-sm font-medium',
        isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
      )}>
        <span>{isCorrect ? '✓' : '✗'}</span>
        <span className='flex-1 line-clamp-2'>{feedback}</span>
      </div>

      {!isCorrect && explanation && (
        <p className='text-sm text-muted-foreground leading-relaxed'>
          {explanation}
        </p>
      )}

      <div className='flex items-center justify-between'>
        <span className={cn(
          'text-xs font-medium tabular-nums',
          delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
        )}>
          {deltaText}
        </span>

        {overconfident && (
          <span className='text-xs text-muted-foreground'>
            {t('practice.learn.overconfident', 'Predicted known — worth revisiting')}
          </span>
        )}
      </div>

      <button
        type='button'
        onClick={onNext}
        className='w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer'
      >
        {t('practice.learn.next', 'Enter ↵')}
      </button>
    </div>
  )
}
