import { ArrowRightIcon, CheckCircleIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { cn } from '@/shared/lib/cn'

import type { StabilityDelta } from '../model/practice-mode.store'
import { useMasteryMap, usePracticeModeActions, usePracticeModeSession } from '../model/practice-mode.store'

interface PracticeSessionEndProps {
  className?: string
}

export function PracticeSessionEnd({
  className,
}: PracticeSessionEndProps) {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const masteryMap = useMasteryMap()
  const { endSession, startSession } = usePracticeModeActions()

  if (!session) return null

  const total = session.results.size
  const correct = [...session.results.values()].filter(Boolean).length
  const incorrect = total - correct
  const durationMin = Math.round((Date.now() - session.startedAt) / 60000)
  const freshDueNodeIds = [...masteryMap.values()].filter((d) => d.isDue).map((d) => d.nodeId)
  const zpdNodeIds = [...masteryMap.values()]
    .filter((d) => d.mastery === 'unlearned' && d.prereqsStable)
    .map((d) => d.nodeId)
  const hasNextSession = freshDueNodeIds.length > 0 || zpdNodeIds.length > 0

  const handleAnotherSession = () => {
    if (freshDueNodeIds.length > 0) {
      startSession('review', freshDueNodeIds)
    } else if (zpdNodeIds.length > 0) {
      startSession('learn', zpdNodeIds)
    }
  }

  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-success" />
        <h3 className="text-base font-semibold">{t('practice.mode.sessionComplete')}</h3>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        {total} {t('practice.mode.exercises')} · {correct} {t('practice.mode.correct')} · {incorrect} {t('practice.mode.incorrect')}
        {durationMin > 0 && ` · ${t('practice.mode.durationMinutes', { count: durationMin })}`}
      </div>

      {/* Stability Changes */}
      {session.stabilityDeltas.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2.5">
              {t('practice.mode.stabilityChanges')}
            </h4>
            <div className="space-y-1.5">
              {session.stabilityDeltas.map((d) => (
                <StabilityRow key={d.nodeId} delta={d} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        {hasNextSession && (
          <Button onClick={handleAnotherSession}>
            {t('practice.mode.anotherSession')}
            <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="outline" onClick={endSession}>
          {t('practice.mode.done')}
        </Button>
      </div>
    </div>
  )
}

function StabilityRow({ delta }: { delta: StabilityDelta }) {
  const isPositive = delta.delta >= 0
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="truncate mr-2">{delta.nodeLabel}</span>
      <span
        className={cn(
          'shrink-0 font-medium',
          isPositive ? 'text-success' : 'text-destructive'
        )}
      >
        {isPositive ? '+' : ''}{Math.round(delta.delta * 10) / 10}d{' '}
        {isPositive ? '↑' : '↓'}
      </span>
    </div>
  )
}
