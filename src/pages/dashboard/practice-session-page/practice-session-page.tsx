import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import { useGenerateExercises, useNextExercise, useSubmitAnswer } from '@/entities/exercise'
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
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-6 p-4'>
        <div className='text-center space-y-2'>
          <h2 className='text-xl font-semibold text-balance'>{t('practice.noExercises')}</h2>
          <p className='text-sm text-muted-foreground max-w-xs text-balance'>
            {t('practice.noExercisesDescription')}
          </p>
        </div>

        <div className='flex gap-3'>
          <Button asChild variant='outline'>
            <Link to={`/dashboard/maps/${mapId}/view`}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              {t('common.back')}
            </Link>
          </Button>

          <Button onClick={handleGenerateExercises} disabled={generateExercisesMutation.isPending}>
            {generateExercisesMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('practice.generating')}
              </>
            ) : (
              <>
                <Sparkles className='mr-2 h-4 w-4' />
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
      <header className='flex items-center justify-between border-b border-border px-6 py-4'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={`/dashboard/maps/${mapId}/view`}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('common.back')}
          </Link>
        </Button>
        <div className='text-sm text-muted-foreground'>{t('practice.session')}</div>
      </header>

      {/* Exercise Content */}
      <main className='flex flex-1 items-center justify-center p-8'>
        <div className='w-full max-w-2xl space-y-8'>
          {/* Question */}
          <div className='space-y-4'>
            <h1 className='text-3xl font-bold'>{exercise.question}</h1>
            {exercise.type === 'quiz' && exercise.options && (
              <div className='space-y-3'>
                {exercise.options.map(option => (
                  <button
                    type='button'
                    key={option.id}
                    onClick={() => setSelectedAnswer(option.id)}
                    disabled={showFeedback}
                    className={cn(
                      'w-full rounded-lg border-2 p-4 text-left transition-colors',
                      selectedAnswer === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                      showFeedback && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    {option.content}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Feedback */}
          {showFeedback && exercise.explanation && (
            <div className='rounded-lg border border-border bg-muted/30 p-4'>
              <p className='text-sm'>{exercise.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-3'>
            {!showFeedback ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || submitAnswerMutation.isPending}
              >
                {submitAnswerMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {t('common.submitting')}
                  </>
                ) : (
                  t('practice.submit')
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>{t('practice.next')}</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
