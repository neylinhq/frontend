import { Check, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BadgeProps } from '@/shared/components/badge'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'
import type { ExercisePreviewData } from '../model/ai-assist.types'

interface ExerciseCardProps {
  data: ExercisePreviewData
  index?: number
  total?: number
  className?: string
}

/** Get badge variant based on exercise type */
const getExerciseBadgeVariant = (type: string | undefined): BadgeProps['variant'] => {
  switch (type) {
    case 'quiz':
      return 'info'
    case 'flashcard':
      return 'brand'
    case 'true_false':
      return 'warning'
    case 'fill_gaps':
      return 'success'
    case 'match':
    case 'sequence':
      return 'secondary'
    default:
      return 'secondary'
  }
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

  const { exercise } = data
  if (!exercise) return null

  const exerciseType = exercise.type
  // AI-generated exercises store answer directly, not in metadata
  const correctAnswer = typeof exercise.answer === 'number'
    ? exercise.answer
    : 0

  const isCorrect = selectedAnswer === correctAnswer

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    setIsSubmitted(true)
    setShowExplanation(true)
  }

  const handleReset = () => {
    setSelectedAnswer(null)
    setIsSubmitted(false)
    setShowExplanation(false)
  }

  // Prefer data values, fallback to props
  const exerciseIndex = data.index ?? index
  const exerciseTotal = data.total ?? total

  const title = exerciseIndex !== undefined && exerciseTotal !== undefined
    ? t('ai.exercises.exerciseN', { n: exerciseIndex + 1, total: exerciseTotal, defaultValue: `Exercise ${exerciseIndex + 1}/${exerciseTotal}` })
    : t('ai.exercises.exercise', 'Exercise')

  // Quiz type
  if (exerciseType === 'quiz' && exercise.options) {
    return (
      <div className={cn('border border-border rounded-lg overflow-hidden bg-card', className)}>
        {/* Header */}
        <div className='px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between'>
          <span className='text-xs font-medium text-muted-foreground'>{title}</span>
          <Badge variant={getExerciseBadgeVariant(exerciseType)} className='text-[10px]'>
            {t(`ai.exercises.types.${exerciseType}`, exerciseType)}
          </Badge>
        </div>

        {/* Question */}
        <div className='px-3 py-3'>
          <p className='text-sm font-medium mb-3'>{exercise.question}</p>

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
                    !isSubmitted && isSelected && 'border-primary bg-primary/5',
                    !isSubmitted && !isSelected && 'border-border hover:border-primary/50',
                    isSubmitted && isThisCorrect && 'border-green-500 bg-green-500/10',
                    isSubmitted && isSelected && !isThisCorrect && 'border-red-500 bg-red-500/10',
                    isSubmitted && 'cursor-default'
                  )}
                >
                  <div className='flex items-center gap-2'>
                    {showResult && isThisCorrect && (
                      <Check className='h-4 w-4 text-green-600 flex-shrink-0' />
                    )}
                    {showResult && isSelected && !isThisCorrect && (
                      <X className='h-4 w-4 text-red-500 flex-shrink-0' />
                    )}
                    <span>{optionContent}</span>
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
              {exercise.explanation}
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
      <div className={cn('border border-border rounded-lg overflow-hidden bg-card', className)}>
        <div className='px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between'>
          <span className='text-xs font-medium text-muted-foreground'>{title}</span>
          <Badge variant={getExerciseBadgeVariant(exerciseType)} className='text-[10px]'>
            {t('ai.exercises.types.true_false', 'True/False')}
          </Badge>
        </div>

        <div className='px-3 py-3'>
          <p className='text-sm font-medium mb-3'>{statement}</p>

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
                    !isSubmitted && isSelected && 'border-primary bg-primary/5',
                    !isSubmitted && !isSelected && 'border-border hover:border-primary/50',
                    showResult && isThisCorrect && 'border-green-500 bg-green-500/10',
                    showResult && isSelected && !isThisCorrect && 'border-red-500 bg-red-500/10',
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
              {exercise.explanation}
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
      <div className={cn('border border-border rounded-lg overflow-hidden bg-card', className)}>
        <div className='px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between'>
          <span className='text-xs font-medium text-muted-foreground'>{title}</span>
          <Badge variant={getExerciseBadgeVariant(exerciseType)} className='text-[10px]'>
            {t('ai.exercises.types.flashcard', 'Flashcard')}
          </Badge>
        </div>

        <div className='px-3 py-3'>
          <p className='text-sm font-medium mb-3'>{front}</p>

          {showExplanation ? (
            <div className='p-3 rounded-md bg-muted/30 text-sm'>
              {back}
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
    <div className={cn('border border-border rounded-lg overflow-hidden bg-card', className)}>
      <div className='px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between'>
        <span className='text-xs font-medium text-muted-foreground'>{title}</span>
        <Badge variant={getExerciseBadgeVariant(exerciseType)} className='text-[10px]'>
          {exerciseType}
        </Badge>
      </div>
      <div className='px-3 py-3'>
        <p className='text-sm'>{exercise.question}</p>
        {exercise.explanation && (
          <button
            type='button'
            onClick={() => setShowExplanation(!showExplanation)}
            className='mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
          >
            {showExplanation ? <ChevronDown className='h-3 w-3' /> : <ChevronRight className='h-3 w-3' />}
            {t('ai.exercises.explanation', 'Explanation')}
          </button>
        )}
        {showExplanation && exercise.explanation && (
          <div className='mt-2 p-2 rounded bg-muted/30 text-xs'>
            {exercise.explanation}
          </div>
        )}
      </div>
    </div>
  )
}
