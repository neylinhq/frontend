import { GraduationHat01Icon, Loading02Icon, PlayIcon, Stars01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useGenerateExercises, useNextExercise } from '@/entities/exercise'
import { ApiError } from '@/shared/api/client'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { toast } from '@/shared/components/toast'
import { MAPS_ROUTES } from '@/shared/config'

interface PracticePanelProps {
  nodeId: string
  mapId: string
}

export const PracticePanel = ({ nodeId, mapId }: PracticePanelProps) => {
  const { t } = useTranslation()
  const { data: exercise, isLoading, error } = useNextExercise(mapId, nodeId)
  const generateExercisesMutation = useGenerateExercises()

  const handleGenerateExercises = () => {
    generateExercisesMutation.mutate(
      {
        mapId,
        request: {
          nodeIds: [nodeId],
          difficulty: 3,
          count: 5
        }
      },
      {
        onError: (error: unknown) => {
          // ApiError has data property directly (not response.data like axios)
          const message =
            error instanceof ApiError &&
            typeof error.data === 'object' &&
            error.data !== null
              ? (error.data as { error?: { message?: string } }).error?.message
              : null
          toast.error(message ?? t('errors.failedGenerateExercises'))
        }
      }
    )
  }

  const hasExercises = !error && exercise

  // Loading state
  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center p-4'>
        <Loading02Icon className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  // Empty state - no exercises
  if (!hasExercises) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-4 p-6 text-center'>
        <div className='rounded-lg border border-border/60 bg-muted/30 p-4'>
          <GraduationHat01Icon className='h-7 w-7 text-muted-foreground' />
        </div>
        <div className='space-y-1'>
          <h3 className='text-sm font-medium'>{t('practice.panel.noExercises')}</h3>
          <p className='text-xs text-muted-foreground'>
            {t('practice.panel.noExercisesDescription')}
          </p>
        </div>
        <Button
          onClick={handleGenerateExercises}
          disabled={generateExercisesMutation.isPending}
          className='mt-1 w-full'
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
    )
  }

  // Has exercises state
  return (
    <div className='flex h-full flex-col gap-4 p-4'>
      <div className='rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            {t('practice.panel.nextUp', 'Next up')}
          </span>
          <Badge variant='secondary' className='text-xs font-medium'>
            {t(`practice.types.${exercise.type}`, exercise.type)}
          </Badge>
        </div>
        <p className='text-sm line-clamp-3'>{exercise.question}</p>
      </div>

      {/* Actions */}
      <div className='mt-auto space-y-2'>
        <Button asChild className='w-full'>
          <Link to={`${MAPS_ROUTES.practice(mapId)}?nodeId=${nodeId}`}>
            <PlayIcon className='mr-2 h-4 w-4' />
            {t('practice.panel.startPractice')}
          </Link>
        </Button>
        <Button
          variant='outline'
          onClick={handleGenerateExercises}
          disabled={generateExercisesMutation.isPending}
          className='w-full'
        >
          {generateExercisesMutation.isPending ? (
            <>
              <Loading02Icon className='mr-2 h-4 w-4 animate-spin' />
              {t('practice.generating')}
            </>
          ) : (
            <>
              <Stars01Icon className='mr-2 h-4 w-4' />
              {t('practice.panel.generateMore')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
