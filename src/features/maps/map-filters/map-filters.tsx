import { useTranslation } from 'react-i18next'
import type { MapFilter } from '@/entities/map'
import { SegmentedControl } from '@/shared/components/segmented-control'

interface MapFiltersProps {
  value: MapFilter
  onChange: (value: MapFilter) => void
  counts?: {
    all?: number
    owned?: number
    public?: number
  }
}

export const MapFilters = ({ value, onChange, counts }: MapFiltersProps) => {
  const { t } = useTranslation()

  const options = [
    { value: 'all' as const, label: t('dashboard.mapFilters.all'), count: counts?.all },
    { value: 'owned' as const, label: t('dashboard.mapFilters.myMaps'), count: counts?.owned },
    { value: 'public' as const, label: t('dashboard.mapFilters.public'), count: counts?.public }
  ]

  return <SegmentedControl value={value} onChange={onChange} options={options} />
}
