import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import type { Edge, Node } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { cn } from '@/shared/lib/cn'

import {
  useNodeMastery,
  usePracticeModeActions,
} from '../model/practice-mode.store'

interface PracticeNodeDetailProps {
  node: Node
  edges: Edge[]
  allNodes: Node[]
  className?: string
}

export function PracticeNodeDetail({
  node,
  edges,
  allNodes,
  className,
}: PracticeNodeDetailProps) {
  const { t } = useTranslation()
  const mastery = useNodeMastery(node.id)
  const { setView, startSession } = usePracticeModeActions()

  const prereqEdges = edges.filter(
    (e) => e.targetNodeId === node.id && e.relationType === 'prerequisite'
  )
  const dependentEdges = edges.filter(
    (e) => e.sourceNodeId === node.id && e.relationType === 'prerequisite'
  )

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]))

  const retrievabilityPercent = mastery ? Math.round(mastery.confidence * 100) : 0
  const stabilityDays = mastery ? Math.round(mastery.fsrsStability * 10) / 10 : 0
  const nextReviewLabel = mastery?.nextReviewAt
    ? formatRelativeDate(mastery.nextReviewAt, t)
    : t('practice.mode.nextReviewNotScheduled')

  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Back button */}
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setView('overview')}
      >
        {t('practice.mode.backToOverview')}
      </button>

      {/* Node header */}
      <div>
        <h3 className="text-base font-semibold leading-tight">{node.label}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {node.type} · {t(`practice.mode.${mastery?.mastery ?? 'unlearned'}`)}
        </p>
      </div>

      {/* Memory Card */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">{t('practice.mode.memory')}</h4>

          <div className="space-y-2.5">
            <MemoryRow
              label={t('practice.mode.retrievability')}
              value={`${retrievabilityPercent}%`}
              bar={retrievabilityPercent / 100}
              barColor={retrievabilityPercent >= 80 ? 'bg-success' : retrievabilityPercent >= 50 ? 'bg-warning' : 'bg-destructive'}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('practice.mode.stability')}</span>
              <span className="font-medium">{t('practice.mode.stabilityDays', { count: stabilityDays })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('practice.mode.nextReview')}</span>
              <span className="font-medium">{nextReviewLabel}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('practice.mode.reviews')}</span>
              <span className="font-medium">{t('practice.mode.reviewsTotal', { count: mastery?.reviewCount ?? 0 })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      {prereqEdges.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('practice.mode.prerequisites')}</h4>
            <div className="space-y-1.5">
              {prereqEdges.map((edge) => {
                const sourceNode = nodeMap.get(edge.sourceNodeId)
                const label = sourceNode?.label ?? edge.sourceNodeId
                // In real impl, would get R from masteryMap
                const isStable = mastery?.prereqsStable ?? true
                return (
                  <div key={edge.id} className="flex items-center gap-2 text-xs">
                    {isStable ? (
                      <CheckCircleIcon className="h-3.5 w-3.5 text-success shrink-0" />
                    ) : (
                      <AlertCircleIcon className="h-3.5 w-3.5 text-warning shrink-0" />
                    )}
                    <span className="truncate">{label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Depends on this */}
      {dependentEdges.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              {t('practice.mode.dependsOnThis')} ({dependentEdges.length})
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {dependentEdges.slice(0, 5).map((edge) => {
                const targetNode = nodeMap.get(edge.targetNodeId)
                return (
                  <div key={edge.id} className="truncate">
                    {targetNode?.label ?? edge.targetNodeId}
                  </div>
                )
              })}
              {dependentEdges.length > 5 && (
                <div>{t('practice.mode.andMore', { count: dependentEdges.length - 5 })}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        <Button onClick={() => startSession('review', [node.id])}>
          {t('practice.mode.practiceThisNode')}
          <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          onClick={() => startSession('deep_dive', [node.id])}
        >
          {t('practice.mode.deepDive')}
        </Button>
      </div>
    </div>
  )
}

function MemoryRow({
  label,
  value,
  bar,
  barColor,
}: {
  label: string
  value: string
  bar: number
  barColor: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.round(bar * 100)}%` }}
        />
      </div>
    </div>
  )
}

function formatRelativeDate(dateStr: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return t('practice.mode.nextReviewOverdue', { count: Math.abs(diffDays) })
  }
  if (diffDays === 0) {
    return t('practice.mode.nextReviewToday')
  }
  if (diffDays === 1) {
    return t('practice.mode.nextReviewTomorrow')
  }
  return t('practice.mode.nextReviewIn', { count: diffDays })
}
