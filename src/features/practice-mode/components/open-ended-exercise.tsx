import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'

import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'

interface OpenEndedExerciseProps {
  question: string
  onSubmit: (answer: string) => void
  disabled?: boolean
  /** For productive failure challenge: softer framing */
  isChallenge?: boolean
}

export function OpenEndedExercise({
  question,
  onSubmit,
  disabled,
  isChallenge,
}: OpenEndedExerciseProps) {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && answer.trim()) {
      onSubmit(answer.trim())
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {isChallenge && (
        <p className="text-xs text-muted-foreground">
          {t('practice.mode.beforeWeExplain')}
        </p>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none"><Markdown>{question}</Markdown></div>

      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isChallenge ? t('practice.mode.yourGuess') : t('practice.mode.yourAnswer')}
        className="min-h-[100px] text-sm"
        disabled={disabled}
      />

      <div className="flex gap-2">
        <Button
          onClick={() => onSubmit(answer.trim())}
          disabled={!answer.trim() || disabled}
          className="flex-1"
        >
          {isChallenge ? t('practice.mode.submitGuess') : t('practice.mode.submit')}
        </Button>
        {isChallenge && (
          <Button
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={() => onSubmit('')}
            disabled={disabled}
          >
            {t('practice.mode.skipExplainFirst')}
          </Button>
        )}
      </div>
    </div>
  )
}
