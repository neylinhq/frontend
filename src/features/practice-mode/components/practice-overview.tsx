'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MasteryLevel } from '@/entities/progress'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

import { practiceModeApi } from '../api/practice-mode.api'
import {
  useMasteryMap,
  usePracticeModeActions,
} from '../model/practice-mode.store'
import { usePracticeScope } from '../model/practice-mode.hooks'

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

interface PracticeOverviewProps {
  mapId: string
  className?: string
}

export function PracticeOverview({ mapId, className }: PracticeOverviewProps) {
  const { t } = useTranslation()
  const { scopeNodeIds, scopeLabel } = usePracticeScope(mapId)
  const masteryMap = useMasteryMap()
  const { startTutorSession, startReviewSession, setScopeNodeIds } = usePracticeModeActions()
  const [isStarting, setIsStarting] = useState<'tutor' | 'review' | null>(null)

  const scopeStats = useMemo(() => {
    const scopeSet = new Set(scopeNodeIds)
    let mastered = 0
    let proficient = 0
    let practicing = 0
    let learning = 0
    let notStarted = 0
    let dueCount = 0
    let zpdCount = 0
    let total = 0

    for (const data of masteryMap.values()) {
      if (!scopeSet.has(data.nodeId)) {
        continue
      }
      total++
      switch (data.mastery) {
        case 'mastered': {
          mastered++
          break
        }
        case 'proficient': {
          proficient++
          break
        }
        case 'practicing': {
          practicing++
          break
        }
        case 'learning': {
          learning++
          break
        }
        case 'unlearned': {
          notStarted++
          if (data.prereqsStable) {
            zpdCount++
          }
          break
        }
      }
      if (data.isDue) {
        dueCount++
      }
    }

    const masteryPercent =
      total > 0 ? Math.round(((mastered + proficient) / total) * 100) : 0

    return { total, mastered, proficient, practicing, learning, notStarted, dueCount, zpdCount, masteryPercent }
  }, [masteryMap, scopeNodeIds])

  const handleStartTutor = async () => {
    setIsStarting('tutor')
    try {
      setScopeNodeIds(scopeNodeIds)
      const result = await practiceModeApi.startScopedSession(mapId, 'tutor', scopeNodeIds)
      startTutorSession(result.chain)
    } catch {
      // Error handled by caller — user stays on overview
    } finally {
      setIsStarting(null)
    }
  }

  const handleStartReview = async () => {
    setIsStarting('review')
    try {
      setScopeNodeIds(scopeNodeIds)
      const result = await practiceModeApi.startScopedSession(mapId, 'review', scopeNodeIds)
      startReviewSession(result.chain)
    } catch {
      // Error handled by caller — user stays on overview
    } finally {
      setIsStarting(null)
    }
  }

  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Scope label */}
      <span className="text-xs font-medium text-muted-foreground">{scopeLabel}</span>

      {/* Progress bar */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('practice.mode.mapMastery')}
          </span>
          <span className="text-lg font-semibold">{scopeStats.masteryPercent}%</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
          {scopeStats.total > 0 && (
            <>
              {scopeStats.mastered > 0 && (
                <div
                  className={cn('transition-all duration-500', MASTERY_BAR_COLORS.mastered)}
                  style={{ width: `${(scopeStats.mastered / scopeStats.total) * 100}%` }}
                />
              )}
              {scopeStats.proficient > 0 && (
                <div
                  className={cn('transition-all duration-500', MASTERY_BAR_COLORS.proficient)}
                  style={{ width: `${(scopeStats.proficient / scopeStats.total) * 100}%` }}
                />
              )}
              {scopeStats.practicing > 0 && (
                <div
                  className={cn('transition-all duration-500', MASTERY_BAR_COLORS.practicing)}
                  style={{ width: `${(scopeStats.practicing / scopeStats.total) * 100}%` }}
                />
              )}
              {scopeStats.learning > 0 && (
                <div
                  className={cn('transition-all duration-500', MASTERY_BAR_COLORS.learning)}
                  style={{ width: `${(scopeStats.learning / scopeStats.total) * 100}%` }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Mastery legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <LegendItem color={MASTERY_DOT_COLORS.mastered} label={t('practice.mode.mastered')} count={scopeStats.mastered} />
        <LegendItem color={MASTERY_DOT_COLORS.proficient} label={t('practice.mode.proficient')} count={scopeStats.proficient} />
        <LegendItem color={MASTERY_DOT_COLORS.practicing} label={t('practice.mode.practicing')} count={scopeStats.practicing} />
        <LegendItem color={MASTERY_DOT_COLORS.learning} label={t('practice.mode.learning')} count={scopeStats.learning} />
        <LegendItem color={MASTERY_DOT_COLORS.unlearned} label={t('practice.mode.unlearned')} count={scopeStats.notStarted} />
      </div>

      {/* Session buttons */}
      <div className="flex flex-col gap-2 mt-2">
        <Button
          onClick={handleStartTutor}
          disabled={scopeStats.zpdCount === 0 || isStarting !== null}
        >
          {isStarting === 'tutor'
            ? t('practice.mode.starting')
            : t('practice.mode.learn')}
        </Button>
        <Button
          variant="outline"
          onClick={handleStartReview}
          disabled={scopeStats.dueCount === 0 || isStarting !== null}
        >
          {isStarting === 'review'
            ? t('practice.mode.starting')
            : t('practice.mode.review')}
          {scopeStats.dueCount > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({scopeStats.dueCount})
            </span>
          )}
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
