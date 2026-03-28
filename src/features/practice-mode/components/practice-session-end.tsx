'use client'

import { CheckCircleIcon } from '@untitledui/icons-react/outline'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { cn } from '@/shared/lib/cn'

import type { ExpandDirection } from '../api/practice-mode.api'
import { practiceModeApi } from '../api/practice-mode.api'
import type { StabilityDelta } from '../model/practice-mode.store'
import { usePracticeModeActions, usePracticeModeSession } from '../model/practice-mode.store'

interface PracticeSessionEndProps {
  mapId: string
  className?: string
}

export function PracticeSessionEnd({ mapId, className }: PracticeSessionEndProps) {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const { endSession } = usePracticeModeActions()
  const [suggestions, setSuggestions] = useState<ExpandDirection[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Fetch expand suggestions on mount
  useEffect(() => {
    if (!session) {
      return
    }
    const coveredNodeIds = session.nodeQueue
    if (coveredNodeIds.length === 0) {
      return
    }

    setLoadingSuggestions(true)
    practiceModeApi
      .getExpandSuggestions(mapId, coveredNodeIds)
      .then(setSuggestions)
      .catch(() => {
        // Silent fail — suggestions are optional
      })
      .finally(() => setLoadingSuggestions(false))
  }, [mapId, session])

  const handleDone = useCallback(() => {
    endSession()
  }, [endSession])

  if (!session) {
    return null
  }

  const total = session.results.size
  const correct = [...session.results.values()].filter(Boolean).length
  const incorrect = total - correct
  const durationMin = Math.round((Date.now() - session.startedAt) / 60000)
  const isTutor = session.mode === 'tutor'

  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-success" />
        <h3 className="text-base font-semibold">{t('practice.mode.sessionComplete')}</h3>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        {isTutor
          ? t('practice.session.tutorSummary', {
              nodes: session.nodeQueue.length,
              defaultValue: '{{nodes}} concepts covered',
            })
          : `${total} ${t('practice.mode.exercises')} · ${correct} ${t('practice.mode.correct')} · ${incorrect} ${t('practice.mode.incorrect')}`}
        {durationMin > 0 &&
          ` · ${t('practice.mode.durationMinutes', { count: durationMin })}`}
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

      {/* Expand Suggestions */}
      {!loadingSuggestions && suggestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2.5">
              {t('practice.session.expandTitle', 'Expand your map?')}
            </h4>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <div
                  key={s.direction}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-muted-foreground shrink-0">+</span>
                  <div className="min-w-0">
                    <span className="font-medium">{s.direction}</span>
                    {s.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loadingSuggestions && (
        <div className="text-xs text-muted-foreground text-center py-2">
          {t('practice.session.loadingSuggestions', 'Looking for expansion ideas...')}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <Button variant="outline" onClick={handleDone}>
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
        {isPositive ? '+' : ''}
        {Math.round(delta.delta * 10) / 10}d {isPositive ? '↑' : '↓'}
      </span>
    </div>
  )
}
