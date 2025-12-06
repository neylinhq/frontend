import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useNextExercise, useSubmitAnswer } from '@/entities/exercise'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

export const PracticeSessionPage = () => {
  const { t } = useTranslation()
  const { mapId } = useParams<{ mapId: string }>()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const { data: exercise, isLoading, error } = useNextExercise(mapId!)
  const submitAnswerMutation = useSubmitAnswer()

  const handleSubmit = () => {
    if (!exercise || !selectedAnswer) return

    submitAnswerMutation.mutate(
      { exerciseId: exercise.id, answer: selectedAnswer },
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
  }

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-4'>
        <p className='text-muted-foreground'>{t('practice.noExercises')}</p>
        <Button asChild variant='outline'>
          <Link to={`/dashboard/maps/${mapId}/view`}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('common.back')}
          </Link>
        </Button>
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
