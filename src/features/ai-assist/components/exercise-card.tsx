import { CheckIcon, ChevronDownIcon, ChevronRightIcon, XCloseIcon } from '@untitledui/icons-react/outline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'
import type { ExercisePreviewData } from '../model/ai-assist.types'

/** Inline markdown renderer for exercise text */
const InlineMarkdown = ({ children }: { children: string }) => (
  <Markdown
    remarkPlugins={[remarkGfm]}
    components={{
      // Override block elements to inline
      p: ({ children }) => <span>{children}</span>
    }}
  >
    {children}
  </Markdown>
)

interface ExerciseCardProps {
  data: ExercisePreviewData
  index?: number
  total?: number
  className?: string
}

/**
 * Interactive exercise card for solving exercises in chat.
 * Auto-displays after AI generates, no Accept/Reject buttons.
 */
export const ExerciseCard = ({ data, index, total, className }: ExerciseCardProps) => {
  const { t } = useTranslation()
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const { exercise } = data
  if (!exercise) return null

  const exerciseType = exercise.type
  // AI-generated exercises store answer directly, not in metadata
  const correctAnswer = typeof exercise.answer === 'number'
    ? exercise.answer
    : 0

  const isCorrect = selectedAnswer === correctAnswer

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null) return
    setIsSubmitted(true)
    setShowExplanation(true)
  }, [selectedAnswer])

  const handleReset = () => {
    setSelectedAnswer(null)
    setIsSubmitted(false)
    setShowExplanation(false)
  }

  // Keyboard navigation: 1-9 to select options, Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when card is focused or contains focus
      if (!cardRef.current?.contains(document.activeElement) && document.activeElement !== cardRef.current) {
        return
      }

      // Number keys 1-9 to select options
      if (e.key >= '1' && e.key <= '9' && !isSubmitted) {
        const optionIdx = parseInt(e.key) - 1
        if (exercise.options && optionIdx < exercise.options.length) {
          e.preventDefault()
          setSelectedAnswer(optionIdx)
        }
      }

      // Enter to submit
      if (e.key === 'Enter' && selectedAnswer !== null && !isSubmitted) {
        e.preventDefault()
        handleSubmit()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [exercise.options, isSubmitted, selectedAnswer, handleSubmit])

  // Prefer data values, fallback to props
  const exerciseIndex = data.index ?? index
  const exerciseTotal = data.total ?? total

  const title = exerciseIndex !== undefined && exerciseTotal !== undefined
    ? t('ai.exercises.exerciseN', { n: exerciseIndex + 1, total: exerciseTotal, defaultValue: `Exercise ${exerciseIndex + 1}/${exerciseTotal}` })
    : t('ai.exercises.exercise', 'Exercise')

  // Quiz type
  if (exerciseType === 'quiz' && exercise.options) {
    return (
      <div
        ref={cardRef}
        tabIndex={0}
        className={cn('border border-border/60 rounded-lg overflow-hidden bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', className)}
        aria-label={t('ai.exercises.quizCard', 'Quiz exercise. Press 1-9 to select an answer, Enter to submit.')}
      >
        {/* Header */}
        <div className='px-3 py-2 bg-muted/30 border-b border-border/60 flex items-center justify-between'>
          <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>{title}</span>
          <Badge variant='secondary' className='text-[10px]'>
            {t(`ai.exercises.types.${exerciseType}`, exerciseType)}
          </Badge>
        </div>

        {/* Question */}
        <div className='px-3 py-3'>
          <div className='text-sm font-medium mb-3'>
            <InlineMarkdown>{exercise.question}</InlineMarkdown>
          </div>

          {/* Options */}
          <div className='space-y-2'>
            {exercise.options.map((option, idx) => {
              const optionContent = typeof option === 'object' ? option.content : option
              const isSelected = selectedAnswer === idx
              const showResult = isSubmitted
              const isThisCorrect = idx === correctAnswer

              return (
                <button
                  key={idx}
                  type='button'
                  onClick={() => !isSubmitted && setSelectedAnswer(idx)}
                  disabled={isSubmitted}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md border text-sm transition-colors',
                    // Not submitted: subtle selection via background only
                    !isSubmitted && isSelected && 'border-border bg-muted',
                    !isSubmitted && !isSelected && 'border-border hover:bg-muted/50',
                    // Submitted: semantic colors for feedback (muted borders)
                    isSubmitted && isThisCorrect && 'border-success/50 bg-success/10',
                    isSubmitted && isSelected && !isThisCorrect && 'border-destructive/50 bg-destructive/10',
                    isSubmitted && 'cursor-default'
                  )}
                >
                  <div className='flex items-center gap-2'>
                    {showResult && isThisCorrect && (
                      <CheckIcon className='h-4 w-4 text-success flex-shrink-0' aria-hidden='true' />
                    )}
                    {showResult && isSelected && !isThisCorrect && (
                      <XCloseIcon className='h-4 w-4 text-destructive flex-shrink-0' aria-hidden='true' />
                    )}
                    <span><InlineMarkdown>{optionContent}</InlineMarkdown></span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showExplanation && exercise.explanation && (
            <div className='mt-3 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground'>
              <div className='font-medium mb-1'>
                {isCorrect ? t('ai.exercises.correct', 'Correct!') : t('ai.exercises.incorrect', 'Incorrect')}
              </div>
              <InlineMarkdown>{exercise.explanation}</InlineMarkdown>
            </div>
          )}

          {/* Actions */}
          <div className='mt-3 flex justify-end gap-2'>
            {!isSubmitted ? (
              <Button
                size='sm'
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
              >
                {t('ai.exercises.check', 'Check')}
              </Button>
            ) : (
              <Button size='sm' variant='outline' onClick={handleReset}>
                {t('ai.exercises.tryAgain', 'Try again')}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // True/False type
  if (exerciseType === 'true_false') {
    const statement = exercise.question
    const correctBool = exercise.answer as boolean

    return (
      <div className={cn('border border-border/60 rounded-lg overflow-hidden bg-card', className)}>
        <div className='px-3 py-2 bg-muted/30 border-b border-border/60 flex items-center justify-between'>
          <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>{title}</span>
          <Badge variant='secondary' className='text-[10px]'>
            {t('ai.exercises.types.true_false', 'True/False')}
          </Badge>
        </div>

        <div className='px-3 py-3'>
          <div className='text-sm font-medium mb-3'>
            <InlineMarkdown>{statement}</InlineMarkdown>
          </div>

          <div className='flex gap-2'>
            {[true, false].map(value => {
              const isSelected = selectedAnswer === (value ? 1 : 0)
              const showResult = isSubmitted
              const isThisCorrect = value === correctBool

              return (
                <button
                  key={String(value)}
                  type='button'
                  onClick={() => !isSubmitted && setSelectedAnswer(value ? 1 : 0)}
                  disabled={isSubmitted}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-colors',
                    // Not submitted: subtle selection via background only
                    !isSubmitted && isSelected && 'border-border bg-muted',
                    !isSubmitted && !isSelected && 'border-border hover:bg-muted/50',
                    // Submitted: semantic colors for feedback (muted borders)
                    showResult && isThisCorrect && 'border-success/50 bg-success/10',
                    showResult && isSelected && !isThisCorrect && 'border-destructive/50 bg-destructive/10',
                    isSubmitted && 'cursor-default'
                  )}
                >
                  {value ? t('common.true', 'True') : t('common.false', 'False')}
                </button>
              )
            })}
          </div>

          {showExplanation && exercise.explanation && (
            <div className='mt-3 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground'>
              <InlineMarkdown>{exercise.explanation}</InlineMarkdown>
            </div>
          )}

          <div className='mt-3 flex justify-end gap-2'>
            {!isSubmitted ? (
              <Button size='sm' onClick={handleSubmit} disabled={selectedAnswer === null}>
                {t('ai.exercises.check', 'Check')}
              </Button>
            ) : (
              <Button size='sm' variant='outline' onClick={handleReset}>
                {t('ai.exercises.tryAgain', 'Try again')}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Flashcard type
  if (exerciseType === 'flashcard') {
    const front = exercise.question
    const back = exercise.explanation || (exercise.answer as string)

    return (
      <div className={cn('border border-border/60 rounded-lg overflow-hidden bg-card', className)}>
        <div className='px-3 py-2 bg-muted/30 border-b border-border/60 flex items-center justify-between'>
          <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>{title}</span>
          <Badge variant='secondary' className='text-[10px]'>
            {t('ai.exercises.types.flashcard', 'Flashcard')}
          </Badge>
        </div>

        <div className='px-3 py-3'>
          <div className='text-sm font-medium mb-3'>
            <InlineMarkdown>{front}</InlineMarkdown>
          </div>

          {showExplanation ? (
            <div className='p-3 rounded-md bg-muted/30 text-sm'>
              <InlineMarkdown>{back}</InlineMarkdown>
            </div>
          ) : (
            <Button size='sm' variant='outline' onClick={() => setShowExplanation(true)}>
              {t('ai.exercises.showAnswer', 'Show answer')}
            </Button>
          )}

          {showExplanation && (
            <div className='mt-3 flex justify-end'>
              <Button size='sm' variant='outline' onClick={() => setShowExplanation(false)}>
                {t('ai.exercises.hideAnswer', 'Hide answer')}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default fallback for other types
  return (
    <div className={cn('border border-border/60 rounded-lg overflow-hidden bg-card', className)}>
      <div className='px-3 py-2 bg-muted/30 border-b border-border/60 flex items-center justify-between'>
        <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>{title}</span>
        <Badge variant='secondary' className='text-[10px]'>
          {exerciseType}
        </Badge>
      </div>
      <div className='px-3 py-3'>
        <div className='text-sm'>
          <InlineMarkdown>{exercise.question}</InlineMarkdown>
        </div>
        {exercise.explanation && (
          <button
            type='button'
            onClick={() => setShowExplanation(!showExplanation)}
            className='mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
          >
            {showExplanation ? <ChevronDownIcon className='h-3 w-3' /> : <ChevronRightIcon className='h-3 w-3' />}
            {t('ai.exercises.explanation', 'Explanation')}
          </button>
        )}
        {showExplanation && exercise.explanation && (
          <div className='mt-2 p-2 rounded bg-muted/30 text-xs'>
            <InlineMarkdown>{exercise.explanation}</InlineMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
