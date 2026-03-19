'use client'

import {
  GraduationHat01Icon,
  Loading02Icon,
  PlayIcon,
  Stars01Icon,
  XCloseIcon
} from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import type { MasteryLevel } from '@/entities/progress'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

import {
  usePracticeModeActions,
  usePracticeModeStats,
  usePracticeModeStore
} from '../model/practice-mode.store'

const MASTERY_COLORS: Record<MasteryLevel, string> = {
  mastered: 'bg-[var(--color-mastery-mastered-muted)] text-[var(--color-mastery-mastered)]',
  practicing: 'bg-[var(--color-mastery-practicing-muted)] text-[var(--color-mastery-practicing)]',
  learning: 'bg-[var(--color-mastery-learning-muted)] text-[var(--color-mastery-learning)]',
  not_started: 'bg-muted text-muted-foreground'
}

const MASTERY_BAR_COLORS: Record<MasteryLevel, string> = {
  mastered: 'bg-[var(--color-mastery-mastered)]',
  practicing: 'bg-[var(--color-mastery-practicing)]',
  learning: 'bg-[var(--color-mastery-learning)]',
  not_started: 'bg-muted-foreground/20'
}

interface PracticeModePanelProps {
  mapId: string
  onClose: () => void
  onStartQuickSession?: () => void
  className?: string
}

export const PracticeModePanel = ({
  mapId,
  onClose,
  onStartQuickSession,
  className
}: PracticeModePanelProps) => {
  const { t } = useTranslation()
  const stats = usePracticeModeStats()
  const isLoading = usePracticeModeStore((s) => s.isLoadingMastery)

  return (
    <div
      className={cn(
        'flex h-full flex-col border-l border-border/60 bg-background',
        className
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border/60 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <GraduationHat01Icon className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{t('practice.mode.title', 'Practice')}</span>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 rounded-xs'
          onClick={onClose}
        >
          <XCloseIcon className='h-4 w-4' />
        </Button>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loading02Icon className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='space-y-5'>
            {/* Mastery distribution */}
            <div className='space-y-3'>
              <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {t('practice.mode.mastery', 'Mastery')}
              </h3>

              {/* Stacked bar */}
              <div className='flex h-2 w-full overflow-hidden rounded-full bg-muted'>
                {stats.total > 0 && (
                  <>
                    {stats.mastered > 0 && (
                      <div
                        className={cn('transition-all duration-500', MASTERY_BAR_COLORS.mastered)}
                        style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.practicing > 0 && (
                      <div
                        className={cn('transition-all duration-500', MASTERY_BAR_COLORS.practicing)}
                        style={{ width: `${(stats.practicing / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.learning > 0 && (
                      <div
                        className={cn('transition-all duration-500', MASTERY_BAR_COLORS.learning)}
                        style={{ width: `${(stats.learning / stats.total) * 100}%` }}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Legend */}
              <div className='grid grid-cols-2 gap-2'>
                <MasteryItem
                  level='mastered'
                  label={t('practice.mode.mastered', 'Mastered')}
                  count={stats.mastered}
                />
                <MasteryItem
                  level='practicing'
                  label={t('practice.mode.practicing', 'Practicing')}
                  count={stats.practicing}
                />
                <MasteryItem
                  level='learning'
                  label={t('practice.mode.learning', 'Learning')}
                  count={stats.learning}
                />
                <MasteryItem
                  level='not_started'
                  label={t('practice.mode.notStarted', 'Not started')}
                  count={stats.notStarted}
                />
              </div>
            </div>

            {/* Due for review */}
            {stats.dueCount > 0 && (
              <div className='rounded-lg border border-[var(--color-mastery-due)] border-opacity-30 bg-[var(--color-mastery-due-muted)] p-3 space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    {t('practice.mode.dueForReview', 'Due for review')}
                  </span>
                  <Badge variant='destructive' className='text-xs'>
                    {stats.dueCount}
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {t('practice.mode.dueDescription', 'These nodes are scheduled for spaced repetition review.')}
                </p>
              </div>
            )}

            {/* Quick session hint */}
            {stats.total > 0 && stats.dueCount === 0 && stats.notStarted > 0 && (
              <div className='rounded-lg border border-border/60 bg-muted/30 p-3'>
                <p className='text-xs text-muted-foreground'>
                  {t('practice.mode.noReviewDue', 'No reviews due. Click a node to deep dive, or start a quick session to practice weak areas.')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className='border-t border-border/60 p-4 space-y-2'>
        <Button
          className='w-full'
          size='sm'
          onClick={onStartQuickSession}
          disabled={stats.total === 0 || isLoading}
        >
          <PlayIcon className='mr-2 h-4 w-4' />
          {stats.dueCount > 0
            ? t('practice.mode.reviewDue', { count: stats.dueCount, defaultValue: `Review ${stats.dueCount} due` })
            : t('practice.mode.quickSession', 'Quick Session')}
        </Button>
      </div>
    </div>
  )
}

const MasteryItem = ({
  level,
  label,
  count
}: {
  level: MasteryLevel
  label: string
  count: number
}) => (
  <div className='flex items-center gap-2'>
    <div className={cn('h-2.5 w-2.5 rounded-full', MASTERY_BAR_COLORS[level])} />
    <span className='text-xs text-muted-foreground'>{label}</span>
    <span className='ml-auto text-xs font-medium tabular-nums'>{count}</span>
  </div>
)
