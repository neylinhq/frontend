import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import type { StabilityDelta } from '../model/practice-mode.store'

interface LearnSessionEndProps {
  totalExercises: number
  correctCount: number
  elapsedMinutes: number
  stabilityDeltas: StabilityDelta[]
  dueCountTomorrow: number
  onClose: () => void
}

export const LearnSessionEnd = ({
  totalExercises,
  correctCount,
  elapsedMinutes,
  stabilityDeltas,
  dueCountTomorrow,
  onClose,
}: LearnSessionEndProps) => {
  const { t } = useTranslation()

  // Deduplicate deltas by nodeId (sum deltas for same node from returns)
  const nodeDeltas = new Map<string, { label: string; delta: number; isNew: boolean }>()
  for (const d of stabilityDeltas) {
    const existing = nodeDeltas.get(d.nodeId)
    if (existing) {
      existing.delta += d.delta
    } else {
      nodeDeltas.set(d.nodeId, {
        label: d.nodeLabel,
        delta: d.delta,
        isNew: d.before === 0,
      })
    }
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-base font-medium'>{t('practice.learn.done', 'Done')}</h3>

      <p className='text-sm text-muted-foreground'>
        {totalExercises} {t('practice.learn.questions', 'questions')} · {correctCount} {t('practice.learn.correct', 'correct')} · {elapsedMinutes}{t('practice.learn.min', 'm')}
      </p>

      {nodeDeltas.size > 0 && (
        <div className='space-y-1'>
          {[...nodeDeltas.entries()].map(([nodeId, { label, delta, isNew }]) => (
            <div key={nodeId} className='flex items-center justify-between text-sm'>
              <span className='truncate mr-3'>{label}</span>
              <span className={cn(
                'tabular-nums shrink-0',
                isNew
                  ? 'text-muted-foreground'
                  : delta >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
              )}>
                {isNew ? t('practice.learn.new', 'new') : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}d`}
              </span>
            </div>
          ))}
        </div>
      )}

      {dueCountTomorrow > 0 && (
        <p className='text-xs text-muted-foreground'>
          {t('practice.learn.tomorrow', 'Tomorrow')}: {dueCountTomorrow} {t('practice.learn.toReview', 'to review')}
        </p>
      )}

      <button
        type='button'
        onClick={onClose}
        className='w-full h-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors cursor-pointer'
      >
        {t('practice.learn.close', 'Close')}
      </button>
    </div>
  )
}
