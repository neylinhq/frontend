import { useTranslation } from 'react-i18next'
import { type RatingSystem, RatingSystemEnum, useUpdateMapProgress } from '@/entities/progress'
import { Field } from '@/shared/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select'
import { toast } from '@/shared/components/toast'

interface RatingSystemSelectorProps {
  mapId: string
  currentSystem: RatingSystem
}

export const RatingSystemSelector = ({ mapId, currentSystem }: RatingSystemSelectorProps) => {
  const { t } = useTranslation()
  const updateMapProgress = useUpdateMapProgress(mapId)

  const handleChange = (value: RatingSystem) => {
    updateMapProgress.mutate(
      { preferredRatingSystem: value },
      {
        onError: () => {
          toast.error(t('errors.failedSave'))
        }
      }
    )
  }

  return (
    <div className='space-y-2'>
      <Field label={t('mapSettings.ratingSystem.label')} size='sm' labelClassName='text-sm font-medium'>
        <Select value={currentSystem} onValueChange={handleChange}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={t('mapSettings.ratingSystem.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {RatingSystemEnum.options.map(option => (
              <SelectItem key={option} value={option} title={t(`mapSettings.ratingSystem.${option}Tooltip`)}>
                {t(`mapSettings.ratingSystem.${option}Short`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <p className='text-xs text-muted-foreground'>{t('mapSettings.ratingSystem.description')}</p>
    </div>
  )
}
