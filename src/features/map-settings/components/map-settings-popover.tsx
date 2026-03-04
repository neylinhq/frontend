import { Settings01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { type RatingSystem, useMapProgress } from '@/entities/progress'
import { Button } from '@/shared/components/button'
import { Label } from '@/shared/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select'

import { RatingSystemSelector } from './rating-system-selector'

interface MapSettingsPopoverProps {
  mapId: string
}

export const MapSettingsPopover = ({ mapId }: MapSettingsPopoverProps) => {
  const { t } = useTranslation()
  const { data: mapProgress } = useMapProgress(mapId)

  const currentSystem = (mapProgress?.preferredRatingSystem ?? 'elo') as RatingSystem

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size='sm' variant='ghost' className='h-8 w-8 p-0' title={t('mapSettings.title')}>
          <Settings01Icon className='w-4 h-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80' align='start'>
        <div className='space-y-3 p-2'>
          <div>
            <h4 className='font-medium text-sm mb-1'>{t('mapSettings.title')}</h4>
            <p className='text-xs text-muted-foreground'>{t('mapSettings.description')}</p>
          </div>

          <RatingSystemSelector mapId={mapId} currentSystem={currentSystem} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
