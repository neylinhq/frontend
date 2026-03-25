import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

interface FlashcardExerciseProps {
  front: string
  back: string
  onSubmit: (recalled: boolean) => void
  disabled?: boolean
}

export function FlashcardExercise({ front, back, onSubmit, disabled }: FlashcardExerciseProps) {
  const { t } = useTranslation()
  const [isFlipped, setIsFlipped] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !isFlipped) {
      e.preventDefault()
      setIsFlipped(true)
    }
    if (isFlipped && e.key === '1') onSubmit(false)
    if (isFlipped && e.key === '2') onSubmit(true)
  }

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Card — Space/Enter to flip */}
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'relative min-h-[160px] rounded-xl border p-6 text-center transition-all duration-300',
          'hover:shadow-sm cursor-pointer',
          isFlipped ? 'bg-muted/50' : 'bg-card'
        )}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        {!isFlipped ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm leading-relaxed">{front}</p>
            <p className="text-xs text-muted-foreground mt-4">{t('practice.mode.tapToReveal')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xs text-muted-foreground mb-2">{t('practice.mode.answer')}</p>
            <p className="text-sm leading-relaxed font-medium">{back}</p>
          </div>
        )}
      </button>

      {/* Self-assessment buttons (visible after flip) */}
      {isFlipped && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => onSubmit(false)}
            disabled={disabled}
          >
            {t('practice.mode.didntKnow')}
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSubmit(true)}
            disabled={disabled}
          >
            {t('practice.mode.knewIt')}
          </Button>
        </div>
      )}
    </div>
  )
}
