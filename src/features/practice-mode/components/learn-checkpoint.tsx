import { useTranslation } from 'react-i18next'

interface LearnCheckpointProps {
  completed: number
  total: number
  correctCount: number
  elapsedMinutes: number
  onContinue: () => void
  onStop: () => void
}

export const LearnCheckpoint = ({
  completed,
  total,
  correctCount,
  elapsedMinutes,
  onContinue,
  onStop,
}: LearnCheckpointProps) => {
  const { t } = useTranslation()

  return (
    <div className='space-y-4 text-center'>
      <p className='text-sm text-muted-foreground'>
        {completed}/{total} · {correctCount} {t('practice.learn.correct', 'correct')} · {elapsedMinutes}{t('practice.learn.min', 'm')}
      </p>

      <div className='flex gap-2'>
        <button
          type='button'
          onClick={onContinue}
          className='flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer'
        >
          {t('practice.learn.continue', 'Continue')}
        </button>
        <button
          type='button'
          onClick={onStop}
          className='flex-1 h-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors cursor-pointer'
        >
          {t('practice.learn.stop', 'Stop')}
        </button>
      </div>
    </div>
  )
}
