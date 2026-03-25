'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

/**
 * SequenceExercise presents items that must be ordered correctly.
 * User taps items to add them to the ordered list. Submits array of IDs in order.
 */

interface SequenceItem {
  id: string
  content: string
}

interface SequenceExerciseProps {
  question: string
  items: SequenceItem[]
  onSubmit: (orderedIds: string[]) => void
  disabled?: boolean
}

export function SequenceExercise({ question, items, onSubmit, disabled }: SequenceExerciseProps) {
  const { t } = useTranslation()
  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const remaining = items.filter((item) => !orderedIds.includes(item.id))

  const handleAdd = useCallback(
    (id: string) => {
      if (disabled) return
      setOrderedIds((prev) => [...prev, id])
    },
    [disabled]
  )

  const handleRemoveLast = useCallback(() => {
    if (disabled) return
    setOrderedIds((prev) => prev.slice(0, -1))
  }, [disabled])

  const handleReset = useCallback(() => {
    if (disabled) return
    setOrderedIds([])
  }, [disabled])

  const allPlaced = orderedIds.length === items.length
  const itemMap = new Map(items.map((item) => [item.id, item]))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed">{question}</p>

      {/* Ordered slots */}
      <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-3 min-h-[60px]">
        {orderedIds.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            {t('practice.mode.tapToOrder', 'Tap items below to order them')}
          </p>
        ) : (
          orderedIds.map((id, idx) => (
            <div key={id} className="flex items-center gap-2 text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {idx + 1}
              </span>
              <span>{itemMap.get(id)?.content}</span>
            </div>
          ))
        )}
      </div>

      {/* Actions for ordered list */}
      {orderedIds.length > 0 && (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleRemoveLast} disabled={disabled}>
            {t('common.undo', 'Undo')}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleReset} disabled={disabled}>
            {t('common.reset', 'Reset')}
          </Button>
        </div>
      )}

      {/* Remaining items to place */}
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => handleAdd(item.id)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs transition-colors',
                'hover:border-primary/50 hover:bg-primary/5',
                disabled && 'pointer-events-none opacity-60'
              )}
            >
              {item.content}
            </button>
          ))}
        </div>
      )}

      <Button onClick={() => onSubmit(orderedIds)} disabled={!allPlaced || disabled} className="mt-1">
        {t('practice.mode.submit')}
      </Button>
    </div>
  )
}
