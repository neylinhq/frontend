import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

interface QuizOption {
  id: string
  content: string
}

interface QuizExerciseProps {
  question: string
  options: QuizOption[]
  onSubmit: (selectedOptionId: string) => void
  disabled?: boolean
}

export function QuizExercise({ question, options, onSubmit, disabled }: QuizExerciseProps) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const num = Number.parseInt(e.key, 10)
    if (num >= 1 && num <= options.length) {
      setSelectedId(options[num - 1].id)
    }
    if (e.key === 'Enter' && selectedId) {
      onSubmit(selectedId)
    }
  }

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyDown} tabIndex={-1}>
      <p className="text-sm leading-relaxed">{question}</p>

      <div className="flex flex-col gap-2">
        {options.map((option, idx) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors',
              'hover:border-primary/50 hover:bg-primary/5',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              selectedId === option.id
                ? 'border-primary bg-primary/10'
                : 'border-border',
              disabled && 'opacity-60 pointer-events-none'
            )}
            onClick={() => setSelectedId(option.id)}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
              {idx + 1}
            </span>
            <span>{option.content}</span>
          </button>
        ))}
      </div>

      <Button
        onClick={() => selectedId && onSubmit(selectedId)}
        disabled={!selectedId || disabled}
        className="mt-1"
      >
        {t('practice.mode.submit')}
      </Button>
    </div>
  )
}
