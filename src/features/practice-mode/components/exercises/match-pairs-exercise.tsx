'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

/**
 * MatchPairsExercise presents two columns of items. The user clicks one from each
 * column to create a match. Submits an object mapping left IDs to right IDs.
 *
 * Expected options format (in exercise.options):
 *   [{ id: "left_0", content: "Term" }, { id: "right_0", content: "Definition" }, ...]
 * Convention: IDs starting with "left_" and "right_" distinguish the columns.
 * Alternatively, first half = left, second half = right.
 */

interface MatchItem {
  id: string
  content: string
}

interface MatchPairsExerciseProps {
  question: string
  leftItems: MatchItem[]
  rightItems: MatchItem[]
  onSubmit: (matches: Record<string, string>) => void
  disabled?: boolean
}

export function MatchPairsExercise({
  question,
  leftItems,
  rightItems,
  onSubmit,
  disabled,
}: MatchPairsExerciseProps) {
  const { t } = useTranslation()
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [matchedRight, setMatchedRight] = useState<Set<string>>(new Set())

  const handleLeftClick = useCallback(
    (id: string) => {
      if (disabled || matches[id]) return
      setSelectedLeft((prev) => (prev === id ? null : id))
    },
    [disabled, matches]
  )

  const handleRightClick = useCallback(
    (id: string) => {
      if (disabled || matchedRight.has(id) || !selectedLeft) return

      setMatches((prev) => ({ ...prev, [selectedLeft]: id }))
      setMatchedRight((prev) => new Set(prev).add(id))
      setSelectedLeft(null)
    },
    [disabled, matchedRight, selectedLeft]
  )

  const handleUnmatch = useCallback(
    (leftId: string) => {
      if (disabled) return
      const rightId = matches[leftId]
      if (!rightId) return

      setMatches((prev) => {
        const next = { ...prev }
        delete next[leftId]
        return next
      })
      setMatchedRight((prev) => {
        const next = new Set(prev)
        next.delete(rightId)
        return next
      })
    },
    [disabled, matches]
  )

  const allMatched = Object.keys(matches).length === leftItems.length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed">{question}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="flex flex-col gap-1.5">
          {leftItems.map((item) => {
            const isMatched = !!matches[item.id]
            const isSelected = selectedLeft === item.id
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => (isMatched ? handleUnmatch(item.id) : handleLeftClick(item.id))}
                className={cn(
                  'rounded-lg border p-2.5 text-left text-xs transition-all',
                  'hover:border-primary/50',
                  isSelected && 'border-primary bg-primary/10 ring-1 ring-primary/30',
                  isMatched && 'border-success/50 bg-success/5 opacity-75',
                  disabled && 'pointer-events-none opacity-60'
                )}
              >
                {item.content}
              </button>
            )
          })}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-1.5">
          {rightItems.map((item) => {
            const isMatched = matchedRight.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled || isMatched || !selectedLeft}
                onClick={() => handleRightClick(item.id)}
                className={cn(
                  'rounded-lg border p-2.5 text-left text-xs transition-all',
                  selectedLeft && !isMatched && 'hover:border-primary/50 cursor-pointer',
                  isMatched && 'border-success/50 bg-success/5 opacity-75',
                  !selectedLeft && !isMatched && 'opacity-50',
                  disabled && 'pointer-events-none opacity-60'
                )}
              >
                {item.content}
              </button>
            )
          })}
        </div>
      </div>

      <Button onClick={() => onSubmit(matches)} disabled={!allMatched || disabled} className="mt-1">
        {t('practice.mode.submit')}
      </Button>
    </div>
  )
}
