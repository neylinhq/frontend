import { GraduationHat01Icon, Loading02Icon, PlayIcon, Stars01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useGenerateExercises, useNextExercise } from '@/entities/exercise'
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
        onError: (error: any) => {
          // ApiError has data property directly (not response.data like axios)
          const message = error?.data?.error?.message || t('errors.failedGenerateExercises')
          toast.error(message)
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
        <div className='rounded-full bg-muted p-4'>
          <GraduationHat01Icon className='h-8 w-8 text-muted-foreground' />
        </div>
        <div className='space-y-1'>
          <h3 className='font-medium'>{t('practice.panel.noExercises')}</h3>
          <p className='text-sm text-muted-foreground'>
            {t('practice.panel.noExercisesDescription')}
          </p>
        </div>
        <Button
          onClick={handleGenerateExercises}
          disabled={generateExercisesMutation.isPending}
          className='mt-2'
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
    <div className='flex h-full flex-col p-4'>
      <div className='flex-1 space-y-3'>
        {/* Preview card */}
        <div className='rounded-lg border border-border bg-muted/30 p-3'>
          <div className='mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
            {t(`practice.types.${exercise.type}`, exercise.type)}
          </div>
          <p className='text-sm line-clamp-2'>{exercise.question}</p>
        </div>
      </div>

      {/* Actions */}
      <div className='mt-4 space-y-2'>
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
