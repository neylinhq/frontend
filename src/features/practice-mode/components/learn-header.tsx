import { ArrowLeftIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

interface LearnHeaderProps {
  completed: number
  total: number
  elapsedSeconds: number
  onExit: () => void
  className?: string
}

export const LearnHeader = ({ completed, total, elapsedSeconds, onExit, className }: LearnHeaderProps) => {
  const { t } = useTranslation()
  const progress = total > 0 ? (completed / total) * 100 : 0
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60

  return (
    <div className={cn('flex items-center gap-4 px-4 h-11 bg-background border-b shrink-0 z-10', className)}>
      <button
        type='button'
        onClick={onExit}
        className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
      >
        <ArrowLeftIcon className='size-4' />
        <span>{t('practice.learn.exit', 'Exit')}</span>
      </button>

      <div className='flex-1 flex items-center gap-3'>
        <div className='flex-1 h-1.5 bg-muted rounded-full overflow-hidden'>
          <div
            className='h-full bg-primary rounded-full transition-all duration-500 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className='text-xs text-muted-foreground tabular-nums whitespace-nowrap'>
          {completed}/{total}
        </span>
      </div>

      <span className='text-xs text-muted-foreground tabular-nums'>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  )
}
