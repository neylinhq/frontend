'use client'

import {
  Loading02Icon,
  PlayIcon,
  ZapIcon
} from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import type { MasteryLevel } from '@/entities/progress'
import type { Node } from '@/entities/map'
import { getNodeBgColor, getNodeIcon, getNodeTextColor } from '@/entities/node'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

import {
  useNodeMastery,
  usePracticeModeStats,
  usePracticeModeStore
} from '../model/practice-mode.store'

const MASTERY_BAR_COLORS: Record<MasteryLevel, string> = {
  mastered: 'bg-[var(--color-mastery-mastered)]',
  practicing: 'bg-[var(--color-mastery-practicing)]',
  learning: 'bg-[var(--color-mastery-learning)]',
  not_started: 'bg-muted-foreground/20'
}

interface PracticeModePanelProps {
  mapId: string
  /** Currently selected node — shown as context card at top */
  selectedNode?: Node | null
  onStartQuickSession?: () => void
  onStartReview?: () => void
  className?: string
}

export const PracticeModePanel = ({
  mapId: _mapId,
  selectedNode,
  onStartQuickSession,
  onStartReview,
  className
}: PracticeModePanelProps) => {
  const { t } = useTranslation()
  const stats = usePracticeModeStats()
  const isLoading = usePracticeModeStore((s) => s.isLoadingMastery)
  const selectedNodeMastery = useNodeMastery(selectedNode?.id ?? '')

  return (
    <div
      className={cn(
        'flex h-full flex-col',
        className
      )}
    >
      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loading02Icon className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='space-y-5'>
            {/* Selected node context */}
            {selectedNode && (
              <SelectedNodeCard node={selectedNode} mastery={selectedNodeMastery} />
            )}

            {/* Map mastery overview */}
            <div className='space-y-3'>
              <h3 className='text-xs font-medium text-muted-foreground'>
                {t('practice.mode.mastery', 'Mastery')}
              </h3>

              {/* Overall progress bar */}
              {stats.total > 0 && (
                <div className='space-y-1.5'>
                  <div className='flex h-2 w-full overflow-hidden rounded-full bg-muted'>
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
                  </div>
                  <p className='text-xs text-muted-foreground tabular-nums'>
                    {Math.round(((stats.mastered + stats.practicing) / stats.total) * 100)}%{' '}
                    {t('practice.mode.progress', 'progress')}
                  </p>
                </div>
              )}

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

            {/* Due for review — calm inline text, not alert */}
            {stats.dueCount > 0 && (
              <p className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground tabular-nums'>{stats.dueCount}</span>{' '}
                {t('practice.mode.dueInline', 'nodes due for review')}
              </p>
            )}

            {/* No reviews hint */}
            {stats.total > 0 && stats.dueCount === 0 && stats.notStarted > 0 && (
              <p className='text-xs text-muted-foreground'>
                {t('practice.mode.noReviewDue', 'No reviews due. Click a node to deep dive, or start a quick session to practice weak areas.')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer actions — two distinct buttons */}
      <div className='border-t border-border/60 p-4 space-y-2'>
        {stats.dueCount > 0 && (
          <Button
            className='w-full'
            size='sm'
            onClick={onStartReview ?? onStartQuickSession}
            disabled={isLoading}
          >
            <PlayIcon className='mr-2 h-4 w-4' />
            {t('practice.mode.reviewDue', { count: stats.dueCount, defaultValue: `Review ${stats.dueCount} due` })}
          </Button>
        )}
        <Button
          variant={stats.dueCount > 0 ? 'outline' : 'default'}
          className='w-full'
          size='sm'
          onClick={onStartQuickSession}
          disabled={stats.total === 0 || isLoading}
        >
          <ZapIcon className='mr-2 h-4 w-4' />
          {t('practice.mode.quickSession', 'Quick Session')}
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Selected Node Context Card
 * ───────────────────────────────────────────────────────────────────────────── */

interface SelectedNodeCardProps {
  node: Node
  mastery: { mastery: MasteryLevel; confidence: number; isDue: boolean } | undefined
}

const SelectedNodeCard = ({ node, mastery }: SelectedNodeCardProps) => {
  const { t } = useTranslation()
  const NodeIcon = getNodeIcon(node.type)
  const iconColor = getNodeTextColor(node.type)
  const iconBg = getNodeBgColor(node.type)

  const masteryLabel = mastery?.mastery
    ? t(`practice.mode.${mastery.mastery === 'not_started' ? 'notStarted' : mastery.mastery}`, mastery.mastery)
    : t('practice.mode.notStarted', 'Not started')

  return (
    <div className='rounded-lg border border-border/60 bg-muted/20 p-3'>
      <div className='flex items-start gap-3'>
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', iconBg)}>
          <NodeIcon className={cn('h-4 w-4', iconColor)} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium truncate'>{node.label}</p>
          <div className='flex items-center gap-2 mt-1'>
            <span className='text-xs text-muted-foreground'>{masteryLabel}</span>
            {mastery?.confidence != null && (
              <>
                <span className='text-muted-foreground/40'>·</span>
                <span className='text-xs text-muted-foreground tabular-nums'>
                  {Math.round(mastery.confidence * 100)}%
                </span>
              </>
            )}
            {mastery?.isDue && (
              <>
                <span className='text-muted-foreground/40'>·</span>
                <span className='text-xs text-[var(--color-mastery-due)]'>
                  {t('practice.mode.due', 'Due')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Mastery Legend Item
 * ───────────────────────────────────────────────────────────────────────────── */

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
