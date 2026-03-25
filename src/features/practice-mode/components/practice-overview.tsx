import { ArrowRightIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import type { MasteryLevel } from '@/entities/progress'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { cn } from '@/shared/lib/cn'

import {
  useMasteryMap,
  usePracticeModeActions,
  usePracticeModeStats,
  useZPDFrontierCount,
} from '../model/practice-mode.store'

const MASTERY_BAR_COLORS: Record<MasteryLevel, string> = {
  mastered: 'bg-[var(--color-mastery-mastered)]',
  proficient: 'bg-[var(--color-mastery-proficient,var(--color-mastery-mastered))]',
  practicing: 'bg-[var(--color-mastery-practicing)]',
  learning: 'bg-[var(--color-mastery-learning)]',
  unlearned: 'bg-muted-foreground/20',
}

const MASTERY_DOT_COLORS: Record<MasteryLevel, string> = {
  mastered: 'bg-[var(--color-mastery-mastered)]',
  proficient: 'bg-[var(--color-mastery-proficient,var(--color-mastery-mastered))]',
  practicing: 'bg-[var(--color-mastery-practicing)]',
  learning: 'bg-[var(--color-mastery-learning)]',
  unlearned: 'bg-muted-foreground/30',
}

// Mastery-based progression tiers (replaces Elo segments).
// Based on % of map nodes at proficient+ level.
const MASTERY_TIERS = [
  { threshold: 0, label: 'beginner' },
  { threshold: 0.1, label: 'explorer' },
  { threshold: 0.25, label: 'learner' },
  { threshold: 0.5, label: 'practitioner' },
  { threshold: 0.75, label: 'expert' },
  { threshold: 0.9, label: 'master' },
] as const

function getMasteryTier(masteryPercent: number) {
  let tier = MASTERY_TIERS[0]
  for (const t of MASTERY_TIERS) {
    if (masteryPercent / 100 >= t.threshold) {
      tier = t
    }
  }
  const idx = MASTERY_TIERS.indexOf(tier)
  const nextTier = idx < MASTERY_TIERS.length - 1 ? MASTERY_TIERS[idx + 1] : null
  const progressInTier = nextTier
    ? (masteryPercent / 100 - tier.threshold) / (nextTier.threshold - tier.threshold)
    : 1
  return { current: tier, next: nextTier, progress: Math.min(1, Math.max(0, progressInTier)) }
}

interface PracticeOverviewProps {
  className?: string
}

export function PracticeOverview({ className }: PracticeOverviewProps) {
  const { t } = useTranslation()
  const stats = usePracticeModeStats()
  const zpdCount = useZPDFrontierCount()
  const masteryMap = useMasteryMap()
  const { startSession } = usePracticeModeActions()

  const masteryPercent =
    stats.total > 0
      ? Math.round(((stats.mastered + stats.proficient) / stats.total) * 100)
      : 0

  const tier = getMasteryTier(masteryPercent)

  const dueNodeIds = [...masteryMap.values()].filter((d) => d.isDue).map((d) => d.nodeId)
  const zpdNodeIds = [...masteryMap.values()]
    .filter((d) => d.mastery === 'unlearned' && d.prereqsStable)
    .map((d) => d.nodeId)
  const practicingNodeIds = [...masteryMap.values()]
    .filter((d) => d.mastery === 'practicing' || d.mastery === 'proficient' || d.mastery === 'mastered')
    .map((d) => d.nodeId)

  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Map Mastery Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {t('practice.mode.mapMastery')}
            </span>
            <span className="text-lg font-semibold">{masteryPercent}%</span>
          </div>

          {/* Stacked mastery bar */}
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted mb-4">
            {stats.total > 0 && (
              <>
                {stats.mastered > 0 && (
                  <div
                    className={cn('transition-all duration-500', MASTERY_BAR_COLORS.mastered)}
                    style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
                  />
                )}
                {stats.proficient > 0 && (
                  <div
                    className={cn('transition-all duration-500', MASTERY_BAR_COLORS.proficient)}
                    style={{ width: `${(stats.proficient / stats.total) * 100}%` }}
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <LegendItem color={MASTERY_DOT_COLORS.mastered} label={t('practice.mode.mastered')} count={stats.mastered} />
            <LegendItem color={MASTERY_DOT_COLORS.proficient} label={t('practice.mode.proficient')} count={stats.proficient} />
            <LegendItem color={MASTERY_DOT_COLORS.practicing} label={t('practice.mode.practicing')} count={stats.practicing} />
            <LegendItem color={MASTERY_DOT_COLORS.learning} label={t('practice.mode.learning')} count={stats.learning} />
            <LegendItem color={MASTERY_DOT_COLORS.unlearned} label={t('practice.mode.unlearned')} count={stats.notStarted} />
          </div>
        </CardContent>
      </Card>

      {/* Ready to Review */}
      {stats.dueCount > 0 && (
        <Card className="border-[var(--color-mastery-due)]/30 bg-[var(--color-mastery-due)]/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{t('practice.mode.readyToReview')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('practice.mode.nodesDue', { count: stats.dueCount })}
                </div>
              </div>
              <Button size="sm" onClick={() => startSession('review', dueNodeIds)}>
                {t('practice.mode.review')}
                <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready to Learn */}
      {zpdCount > 0 && (
        <Card className="border-info/30 bg-info/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{t('practice.mode.readyToLearn')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('practice.mode.conceptsOnFrontier', { count: zpdCount })}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => startSession('learn', zpdNodeIds)}>
                {t('practice.mode.learnNew')}
                <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mastery Tier Card (replaces Elo rating) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t('practice.mode.yourProgress')}
            </span>
            <span className="text-sm font-semibold capitalize">
              {t(`practice.mode.tier.${tier.current.label}`)}
            </span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-muted mb-1.5">
            <div
              className="bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${Math.round(tier.progress * 100)}%` }}
            />
          </div>
          {tier.next && (
            <div className="text-xs text-muted-foreground">
              → {t(`practice.mode.tier.${tier.next.label}`)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary session buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => startSession('deep_dive', practicingNodeIds.slice(0, 1))}>
          {t('practice.mode.deepDive')}
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => startSession('challenge', practicingNodeIds)}>
          {t('practice.mode.challenge')}
        </Button>
      </div>
    </div>
  )
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-2 w-2 rounded-full', color)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium">{count}</span>
    </div>
  )
}
