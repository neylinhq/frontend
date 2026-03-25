'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Exercise, ExerciseType, SubmitAnswerOutput } from '@/entities/exercise'
import { useNextExercise, useSubmitAnswer } from '@/entities/exercise'
import { Button } from '@/shared/components/button'
import { RichMarkdown } from '@/shared/components/rich-markdown'
import { cn } from '@/shared/lib/cn'

import type { StabilityDelta } from '../model/practice-mode.store'
import { usePracticeModeActions, usePracticeModeSession } from '../model/practice-mode.store'
import { ConnectConceptsExercise } from './connect-concepts-exercise'
import { ExplainToAIExercise } from './explain-to-ai-exercise'
import { FillGapsExercise } from './fill-gaps-exercise'
import { FindErrorExercise } from './find-error-exercise'
import { FlashcardExercise } from './flashcard-exercise'
import { MatchPairsExercise } from './match-pairs-exercise'
import { OpenEndedExercise } from './open-ended-exercise'
import { QuizExercise } from './quiz-exercise'
import { SequenceExercise } from './sequence-exercise'
import { TrueFalseExercise } from './true-false-exercise'

// --- Types ---

type AnswerPhase = 'answering' | 'feedback'

interface AnswerResult {
  isCorrect: boolean
  feedback: string
  explanation?: string
  stabilityBefore: number
  stabilityAfter: number
  nextReviewDays: number
}

// --- Component ---

interface ExerciseViewProps {
  mapId: string
  /** All node labels for stability delta display */
  nodeLabels?: Map<string, string>
  className?: string
}

export function ExerciseView({ mapId, nodeLabels, className }: ExerciseViewProps) {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const { recordAnswer, nextExercise } = usePracticeModeActions()

  const [phase, setPhase] = useState<AnswerPhase>('answering')
  const [result, setResult] = useState<AnswerResult | null>(null)

  const currentNodeId = session?.nodeQueue[session.currentIndex]

  // Fetch exercise for the current node in the queue
  const {
    data: exercise,
    isLoading,
    error,
    refetch
  } = useNextExercise(mapId, currentNodeId, !!currentNodeId)

  const submitMutation = useSubmitAnswer()

  const handleSubmit = useCallback(
    (answer: unknown) => {
      if (!exercise || submitMutation.isPending) {
        return
      }

      submitMutation.mutate(
        { mapId, exerciseId: exercise.id, answer },
        {
          onSuccess: (data: SubmitAnswerOutput) => {
            setResult({
              isCorrect: data.isCorrect,
              feedback: data.feedback,
              explanation: data.explanation,
              stabilityBefore: data.stabilityBefore,
              stabilityAfter: data.stabilityAfter,
              nextReviewDays: data.nextReviewDays
            })
            setPhase('feedback')

            // Record in store
            const nodeId = exercise.node_ids[0]
            const delta: StabilityDelta | undefined =
              data.stabilityAfter !== data.stabilityBefore
                ? {
                    nodeId,
                    nodeLabel: nodeLabels?.get(nodeId) ?? nodeId.slice(0, 8),
                    before: data.stabilityBefore,
                    after: data.stabilityAfter,
                    delta: data.stabilityAfter - data.stabilityBefore
                  }
                : undefined
            recordAnswer(nodeId, data.isCorrect, delta)
          }
        }
      )
    },
    [exercise, mapId, submitMutation, recordAnswer, nodeLabels]
  )

  const handleNext = useCallback(() => {
    setPhase('answering')
    setResult(null)
    nextExercise()
  }, [nextExercise])

  // Keyboard shortcut: Enter to go next during feedback
  useEffect(() => {
    if (phase !== 'feedback') {
      return
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleNext])

  if (!session) {
    return null
  }

  const total = session.nodeQueue.length
  const current = session.currentIndex + 1

  // Loading state (may take a few seconds if auto-generating exercises)
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-4 p-4', className)}>
        <ProgressHeader current={current} total={total} />
        <div className='flex flex-col items-center justify-center gap-2 py-12'>
          <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          <p className='text-xs text-muted-foreground animate-pulse'>
            {t('practice.mode.preparingExercise', 'Preparing exercise...')}
          </p>
        </div>
      </div>
    )
  }

  // Error / no exercise state
  if (error || !exercise) {
    return (
      <div className={cn('flex flex-col gap-4 p-4', className)}>
        <ProgressHeader current={current} total={total} />
        <div className='flex flex-col items-center gap-3 py-8 text-center'>
          <p className='text-sm text-muted-foreground'>{t('practice.noExercises')}</p>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              {t('common.retry', 'Retry')}
            </Button>
            <Button variant='ghost' size='sm' onClick={handleNext}>
              {t('practice.mode.skip', 'Skip')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Progress bar */}
      <ProgressHeader current={current} total={total} />

      {/* Exercise content or feedback */}
      {phase === 'answering' ? (
        <ExerciseRenderer
          exercise={exercise}
          onSubmit={handleSubmit}
          disabled={submitMutation.isPending}
        />
      ) : (
        <AnswerFeedback result={result!} onNext={handleNext} />
      )}
    </div>
  )
}

// --- Sub-components ---

function ProgressHeader({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0
  return (
    <div className='flex items-center gap-3'>
      <div className='flex-1 h-1.5 rounded-full bg-muted overflow-hidden'>
        <div
          className='h-full rounded-full bg-primary transition-all duration-300'
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className='text-xs tabular-nums text-muted-foreground shrink-0'>
        {current}/{total}
      </span>
    </div>
  )
}

function ExerciseRenderer({
  exercise,
  onSubmit,
  disabled
}: {
  exercise: Exercise
  onSubmit: (answer: unknown) => void
  disabled?: boolean
}) {
  const options = exercise.options ?? []

  switch (exercise.type as ExerciseType) {
    case 'quiz':
      return (
        <QuizExercise
          question={exercise.question}
          options={options}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )

    case 'flashcard':
      return (
        <FlashcardExercise
          front={exercise.question}
          back={exercise.explanation ?? ''}
          onSubmit={recalled => onSubmit(recalled)}
          disabled={disabled}
        />
      )

    case 'true_false':
      return (
        <TrueFalseExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    case 'fill_gaps':
      return (
        <FillGapsExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    case 'match': {
      const half = Math.ceil(options.length / 2)
      return (
        <MatchPairsExercise
          question={exercise.question}
          leftItems={options.slice(0, half)}
          rightItems={options.slice(half)}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    }

    case 'sequence':
      return (
        <SequenceExercise
          question={exercise.question}
          items={options}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )

    case 'explain_to_ai':
      return (
        <ExplainToAIExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    case 'connect_concepts':
      return (
        <ConnectConceptsExercise
          question={exercise.question}
          conceptA={exercise.metadata?.tags?.[0]}
          conceptB={exercise.metadata?.tags?.[1]}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )

    case 'find_error':
      return (
        <FindErrorExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    default:
      return (
        <OpenEndedExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )
  }
}

function AnswerFeedback({ result, onNext }: { result: AnswerResult; onNext: () => void }) {
  const { t } = useTranslation()
  const stabilityDelta = result.stabilityAfter - result.stabilityBefore

  return (
    <div className='flex flex-col gap-4'>
      {/* Correct/Incorrect banner */}
      <div
        className={cn(
          'rounded-lg border p-3',
          result.isCorrect
            ? 'border-success/30 bg-success/5'
            : 'border-destructive/30 bg-destructive/5'
        )}
      >
        <p
          className={cn(
            'text-sm font-medium',
            result.isCorrect ? 'text-success' : 'text-destructive'
          )}
        >
          {result.isCorrect
            ? t('practice.mode.correct_feedback')
            : t('practice.mode.incorrect_feedback')}
        </p>
        {result.feedback && (
          <div className='prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-1'>
            <RichMarkdown>{result.feedback}</RichMarkdown>
          </div>
        )}
      </div>

      {/* Explanation */}
      {result.explanation && (
        <div className='rounded-lg border bg-muted/30 p-3'>
          <p className='text-xs font-medium text-muted-foreground mb-1'>
            {t('practice.mode.explanation', 'Explanation')}
          </p>
          <div className='prose prose-sm dark:prose-invert max-w-none'>
            <RichMarkdown>{result.explanation}</RichMarkdown>
          </div>
        </div>
      )}

      {/* Stability change */}
      <div className='flex items-center justify-between rounded-lg border bg-card p-3'>
        <span className='text-xs text-muted-foreground'>{t('practice.mode.stability')}</span>
        <div className='flex items-center gap-2 text-xs'>
          <span className='tabular-nums'>{Math.round(result.stabilityBefore * 10) / 10}d</span>
          <span className='text-muted-foreground'>→</span>
          <span className='tabular-nums font-medium'>
            {Math.round(result.stabilityAfter * 10) / 10}d
          </span>
          {stabilityDelta !== 0 && (
            <span
              className={cn(
                'tabular-nums font-medium',
                stabilityDelta > 0 ? 'text-success' : 'text-destructive'
              )}
            >
              ({stabilityDelta > 0 ? '+' : ''}
              {Math.round(stabilityDelta * 10) / 10}d)
            </span>
          )}
        </div>
      </div>

      {/* Next button */}
      <Button onClick={onNext} className='mt-1'>
        {t('practice.next')}
      </Button>
    </div>
  )
}
