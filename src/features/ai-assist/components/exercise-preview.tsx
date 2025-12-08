import { useTranslation } from 'react-i18next'
import { Edit2, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import type { ExercisePreviewData } from '../ai-assist.types'

interface ExercisePreviewProps {
  data: unknown
  onRemove: () => void
  onSave: () => void
  onEdit?: (data: unknown) => void
}

export const ExercisePreview = ({
  data,
  onRemove,
  onSave,
  onEdit
}: ExercisePreviewProps) => {
  const { t } = useTranslation()
  const exerciseData = data as ExercisePreviewData

  if (!exerciseData.exercise) {
    return null
  }

  const { exercise, index, total } = exerciseData
  const badgeText = index !== undefined && total !== undefined
    ? t('ai.preview.exercise', { n: index + 1, total })
    : 'Exercise'

  return (
    <Card className='border-2 border-primary/20 bg-primary/5'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <Badge variant='secondary'>{badgeText}</Badge>
          <div className='flex gap-1'>
            {onEdit && (
              <Button
                size='icon'
                variant='ghost'
                className='h-7 w-7'
                onClick={() => onEdit(data)}
              >
                <Edit2 className='h-3 w-3' />
              </Button>
            )}
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7'
              onClick={onRemove}
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-2 pt-0'>
        {/* Question */}
        <div>
          <p className='text-sm font-medium'>{exercise.question}</p>
        </div>

        {/* Options (for quiz type) */}
        {exercise.options && Array.isArray(exercise.options) && (
          <ul className='space-y-1'>
            {exercise.options.map((option: any, idx: number) => (
              <li key={option.id || idx} className='text-xs text-muted-foreground'>
                • {option.content || option}
              </li>
            ))}
          </ul>
        )}

        {/* Type badge */}
        {exercise.type && (
          <div className='pt-2'>
            <Badge variant='outline' className='text-xs'>
              {exercise.type}
            </Badge>
          </div>
        )}

        {/* Save button */}
        <div className='pt-2'>
          <Button
            size='sm'
            className='w-full'
            onClick={onSave}
          >
            {t('ai.preview.apply')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
