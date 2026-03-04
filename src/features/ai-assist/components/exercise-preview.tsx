import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/badge'

import type { ExercisePreviewData } from '../model/ai-assist.types'
import { ProposalCard } from './proposal-card'

interface ExercisePreviewProps {
  data: unknown
  onRemove: () => void
  onSave: () => void
  onEdit?: (data: unknown) => void
  isSaving?: boolean
}

export const ExercisePreview = ({
  data,
  onRemove,
  onSave,
  onEdit,
  isSaving
}: ExercisePreviewProps) => {
  const { t } = useTranslation()
  const exerciseData = data as ExercisePreviewData

  if (!exerciseData.exercise) {
    return null
  }

  const { exercise, index, total } = exerciseData

  const title =
    index !== undefined && total !== undefined
      ? t('ai.preview.exercise', {
          n: index + 1,
          total,
          defaultValue: `Exercise ${index + 1}/${total}`
        })
      : t('ai.preview.exerciseNew', 'New exercise')

  return (
    <ProposalCard
      title={title}
      onAccept={onSave}
      onReject={onRemove}
      onEdit={onEdit ? () => onEdit(data) : undefined}
      variant='compact'
      isLoading={isSaving}
    >
      <div className='space-y-2'>
        {/* Question */}
        <p className='font-medium'>{exercise.question}</p>

        {/* Options (for quiz type) */}
        {exercise.options && Array.isArray(exercise.options) && (
          <ul className='space-y-1 pl-4'>
            {exercise.options.map(
              (option: { id?: string; content?: string } | string, idx: number) => (
                <li
                  key={typeof option === 'object' ? option.id || idx : idx}
                  className='text-xs text-muted-foreground list-disc'
                >
                  {typeof option === 'object' ? option.content : option}
                </li>
              )
            )}
          </ul>
        )}

        {/* Type badge */}
        {exercise.type && (
          <Badge variant='secondary' className='text-xs'>
            {exercise.type}
          </Badge>
        )}
      </div>
    </ProposalCard>
  )
}
