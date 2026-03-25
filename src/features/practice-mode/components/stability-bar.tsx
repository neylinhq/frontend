import type { MasteryLevel } from '@/entities/progress'
import { cn } from '@/shared/lib/cn'

const BAR_COLORS: Record<MasteryLevel, string> = {
  mastered: 'bg-[var(--color-mastery-mastered)]',
  proficient: 'bg-[var(--color-mastery-proficient,var(--color-mastery-mastered))]',
  practicing: 'bg-[var(--color-mastery-practicing)]',
  learning: 'bg-[var(--color-mastery-learning)]',
  unlearned: 'bg-muted-foreground/20',
}

interface StabilityBarProps {
  /** Retrievability 0-1 */
  retrievability: number
  mastery: MasteryLevel
  className?: string
}

/**
 * Thin horizontal bar showing current retrievability.
 * Placed at the bottom of a node card in practice mode.
 * Width = retrievability %, color = mastery level.
 */
export function StabilityBar({ retrievability, mastery, className }: StabilityBarProps) {
  const percent = Math.round(Math.max(0, Math.min(1, retrievability)) * 100)

  return (
    <div className={cn('h-1 w-full rounded-full bg-muted/50 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300 ease-out', BAR_COLORS[mastery])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
