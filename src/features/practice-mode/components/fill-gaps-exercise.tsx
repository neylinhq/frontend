'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

/**
 * FillGapsExercise renders a text with blanks (marked as `___` or `{{N}}`) and
 * input fields for each gap. Submits an array of gap values.
 *
 * Expected question format: "The {{0}} is the capital of {{1}}."
 * Expected answer format: ["Paris", "France"]
 */

interface FillGapsExerciseProps {
  question: string
  /** Number of gaps (derived from question pattern count) */
  gapCount?: number
  onSubmit: (answers: string[]) => void
  disabled?: boolean
}

// Matches {{0}}, {{1}}, etc. or ___ (3+ underscores)
const GAP_PATTERN = /\{\{(\d+)\}\}|_{3,}/g

export function FillGapsExercise({ question, gapCount, onSubmit, disabled }: FillGapsExerciseProps) {
  const { t } = useTranslation()

  // Parse gaps from question
  const parts = parseGapQuestion(question)
  const detectedGapCount = gapCount ?? parts.filter((p) => p.type === 'gap').length

  const [values, setValues] = useState<string[]>(() => Array(detectedGapCount).fill(''))

  const handleChange = useCallback((index: number, value: string) => {
    setValues((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const allFilled = values.every((v) => v.trim().length > 0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && allFilled) {
      onSubmit(values.map((v) => v.trim()))
    }
  }

  let gapIndex = 0

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
      {/* Rendered question with inline inputs */}
      <div className="text-sm leading-loose">
        {parts.map((part, i) => {
          if (part.type === 'text') {
            return <span key={i}>{part.value}</span>
          }
          const idx = gapIndex++
          return (
            <input
              key={i}
              type="text"
              value={values[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
              disabled={disabled}
              autoFocus={idx === 0}
              className={cn(
                'inline-block mx-1 w-28 border-b-2 border-primary/40 bg-transparent',
                'px-1 py-0.5 text-sm text-center outline-none transition-colors',
                'focus:border-primary',
                disabled && 'opacity-60'
              )}
              placeholder={`${idx + 1}`}
            />
          )
        })}
      </div>

      <Button
        onClick={() => onSubmit(values.map((v) => v.trim()))}
        disabled={!allFilled || disabled}
        className="mt-1"
      >
        {t('practice.mode.submit')}
      </Button>
    </div>
  )
}

// --- Helpers ---

interface QuestionPart {
  type: 'text' | 'gap'
  value: string
}

function parseGapQuestion(question: string): QuestionPart[] {
  const parts: QuestionPart[] = []
  let lastIndex = 0

  for (const match of question.matchAll(GAP_PATTERN)) {
    if (match.index !== undefined && match.index > lastIndex) {
      parts.push({ type: 'text', value: question.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'gap', value: match[1] ?? '' })
    lastIndex = (match.index ?? 0) + match[0].length
  }

  if (lastIndex < question.length) {
    parts.push({ type: 'text', value: question.slice(lastIndex) })
  }

  // If no gaps found, treat entire question as text + 1 gap below
  if (parts.filter((p) => p.type === 'gap').length === 0) {
    parts.push({ type: 'gap', value: '0' })
  }

  return parts
}
