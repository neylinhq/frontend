import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

interface MemoryUpdateCardProps {
  stabilityBefore: number
  stabilityAfter: number
  nextReviewDays: number
  className?: string
}

/**
 * Displays the concrete memory change after answering an exercise.
 * SDT-aligned: informational feedback on competence growth, not tangible rewards.
 * Shows real metrics (stability in days) instead of abstract points/XP.
 */
export function MemoryUpdateCard({
  stabilityBefore,
  stabilityAfter,
  nextReviewDays,
  className,
}: MemoryUpdateCardProps) {
  const { t } = useTranslation()
  const delta = stabilityAfter - stabilityBefore
  const isPositive = delta >= 0

  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-xs',
        isPositive
          ? 'border-success/30 bg-success/5'
          : 'border-destructive/30 bg-destructive/5',
        className
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground">{t('practice.mode.stability')}</span>
        <span className="font-medium">
          {formatDays(stabilityBefore)} → {formatDays(stabilityAfter)}
        </span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground">{t('practice.mode.nextReview')}</span>
        <span className="font-medium">{t('practice.mode.nextReviewIn', { count: nextReviewDays })}</span>
      </div>
      <div
        className={cn(
          'text-right font-semibold',
          isPositive ? 'text-success' : 'text-destructive'
        )}
      >
        {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}
        {formatDays(delta)}
      </div>
    </div>
  )
}

function formatDays(days: number): string {
  const abs = Math.abs(days)
  if (abs < 1) return `${Math.round(abs * 24)}h`
  return `${Math.round(abs * 10) / 10}d`
}
