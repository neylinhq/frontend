'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'

/**
 * FindErrorExercise presents a statement containing an error.
 * The user must identify the error and explain the correction.
 */

interface FindErrorExerciseProps {
  question: string
  onSubmit: (answer: { error: string; correction: string }) => void
  disabled?: boolean
}

export function FindErrorExercise({ question, onSubmit, disabled }: FindErrorExerciseProps) {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [correction, setCorrection] = useState('')

  const canSubmit = error.trim().length > 0 && correction.trim().length > 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
      e.preventDefault()
      onSubmit({ error: error.trim(), correction: correction.trim() })
    }
  }

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
      {/* Statement with error — highlighted */}
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <p className="text-xs font-medium text-destructive/70 mb-1">
          {t('practice.mode.findTheError', 'Find the error in this statement:')}
        </p>
        <p className="text-sm leading-relaxed">{question}</p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {t('practice.mode.whatIsWrong', 'What is wrong?')}
        </label>
        <Textarea
          value={error}
          onChange={(e) => setError(e.target.value)}
          placeholder={t('practice.mode.describeError', 'Describe the error...')}
          className="min-h-[60px] text-sm"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {t('practice.mode.whatIsCorrect', 'What is the correct version?')}
        </label>
        <Textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder={t('practice.mode.describeCorrection', 'Describe the correction...')}
          className="min-h-[60px] text-sm"
          disabled={disabled}
        />
      </div>

      <Button
        onClick={() => onSubmit({ error: error.trim(), correction: correction.trim() })}
        disabled={!canSubmit || disabled}
        className="mt-1"
      >
        {t('practice.mode.submit')}
      </Button>
    </div>
  )
}
