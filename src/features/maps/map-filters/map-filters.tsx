import { useTranslation } from 'react-i18next'

import type { MapFilter } from '@/entities/map'
import { SegmentedControl } from '@/shared/components/segmented-control'

type DashboardFilter = Exclude<MapFilter, 'all'>

interface MapFiltersProps {
  value: DashboardFilter
  onChange: (value: DashboardFilter) => void
  counts?: {
    owned?: number
    public?: number
  }
}

export const MapFilters = ({ value, onChange, counts }: MapFiltersProps) => {
  const { t } = useTranslation()

  const options = [
    { value: 'owned' as const, label: t('dashboard.mapFilters.myMaps'), count: counts?.owned },
    { value: 'public' as const, label: t('dashboard.mapFilters.public'), count: counts?.public }
  ]

  return <SegmentedControl value={value} onChange={onChange} options={options} />
}
