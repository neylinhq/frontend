import { ArrowLeftIcon, Loading02Icon, Stars01Icon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'

import { useGenerateExercises, useNextExercise, useSubmitAnswer } from '@/entities/exercise'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

export const PracticeSessionPage = () => {
  const { t } = useTranslation()
  const { mapId } = useParams<{ mapId: string }>()
  const [searchParams] = useSearchParams()
  const nodeId = searchParams.get('nodeId')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const { data: exercise, isLoading, error, refetch } = useNextExercise(mapId!, nodeId ?? undefined)
  const submitAnswerMutation = useSubmitAnswer()
  const generateExercisesMutation = useGenerateExercises()

  const handleSubmit = () => {
    if (!exercise || !selectedAnswer || !mapId) {
      return
    }

    submitAnswerMutation.mutate(
      { mapId, exerciseId: exercise.id, answer: selectedAnswer },
      {
        onSuccess: () => {
          setShowFeedback(true)
        }
      }
    )
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setShowFeedback(false)
    refetch()
  }

  const handleGenerateExercises = () => {
    if (!mapId) {
      return
    }

    generateExercisesMutation.mutate(
      {
        mapId,
        request: {
          nodeIds: nodeId ? [nodeId] : undefined,
          difficulty: 3, // Medium difficulty
          count: 5 // Generate 5 exercises
        }
      },
      {
        onSuccess: () => {
          // Refetch to get the first exercise
          refetch()
        }
      }
    )
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loading02Icon className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center'>
        <div className='rounded-lg border border-border/60 bg-muted/30 p-3'>
          <Stars01Icon className='h-6 w-6 text-muted-foreground' />
        </div>
        <div className='space-y-1'>
          <h2 className='text-sm font-medium text-balance'>{t('practice.noExercises')}</h2>
          <p className='text-xs text-muted-foreground max-w-xs text-balance'>
            {t('practice.noExercisesDescription')}
          </p>
        </div>

        <div className='flex flex-wrap justify-center gap-2'>
          <Button asChild variant='outline' size='sm'>
            <Link to={`/dashboard/maps/${mapId}/view`}>
              <ArrowLeftIcon className='mr-2 h-4 w-4' />
              {t('common.back')}
            </Link>
          </Button>

          <Button
            onClick={handleGenerateExercises}
            disabled={generateExercisesMutation.isPending}
            size='sm'
          >
            {generateExercisesMutation.isPending ? (
              <>
                <Loading02Icon className='mr-2 h-4 w-4 animate-spin' />
                {t('practice.generating')}
              </>
            ) : (
              <>
                <Stars01Icon className='mr-2 h-4 w-4' />
                {t('practice.generateExercises')}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-screen flex-col'>
      {/* Header */}
      <header className='flex items-center justify-between border-b border-border/60 px-6 py-3'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={`/dashboard/maps/${mapId}/view`}>
            <ArrowLeftIcon className='mr-2 h-4 w-4' />
            {t('common.back')}
          </Link>
        </Button>
        <span className='text-xs uppercase tracking-wide text-muted-foreground'>
          {t('practice.session')}
        </span>
      </header>

      {/* Exercise Content */}
      <main className='flex flex-1 items-center justify-center px-6 py-6'>
        <div className='w-full max-w-2xl space-y-5'>
          <div className='rounded-lg border border-border/60 bg-card overflow-hidden'>
            <div className='flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2'>
              <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {t('practice.exercise', 'Exercise')}
              </span>
              <Badge variant='secondary' className='text-xs font-medium'>
                {t(`practice.types.${exercise.type}`, exercise.type)}
              </Badge>
            </div>
            <div className='px-4 py-4 space-y-4'>
              <h1 className='text-xl font-semibold leading-snug text-balance'>
                {exercise.question}
              </h1>
              {exercise.type === 'quiz' && exercise.options && (
                <div className='space-y-2'>
                  {exercise.options.map(option => (
                    <button
                      type='button'
                      key={option.id}
                      onClick={() => setSelectedAnswer(option.id)}
                      disabled={showFeedback}
                      className={cn(
                        'w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-left text-sm transition-colors',
                        selectedAnswer === option.id
                          ? 'border-border bg-muted/60'
                          : 'hover:bg-muted/30',
                        showFeedback && 'cursor-not-allowed opacity-60'
                      )}
                    >
                      {option.content}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && exercise.explanation && (
            <div className='rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2'>
              <div className='text-xs uppercase tracking-wide text-muted-foreground'>
                {t('practice.explanation', 'Explanation')}
              </div>
              <p className='text-sm text-muted-foreground'>{exercise.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-2'>
            {!showFeedback ? (
              <Button
                size='sm'
                onClick={handleSubmit}
                disabled={!selectedAnswer || submitAnswerMutation.isPending}
              >
                {submitAnswerMutation.isPending ? (
                  <>
                    <Loading02Icon className='mr-2 h-4 w-4 animate-spin' />
                    {t('common.submitting')}
                  </>
                ) : (
                  t('practice.submit')
                )}
              </Button>
            ) : (
              <Button size='sm' onClick={handleNext}>
                {t('practice.next')}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
