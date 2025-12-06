import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { MapEntity } from '@/entities/map'
import { CreateMapCard } from '@/features/maps/create-map-button'
import { MapCard } from '@/features/maps/map-card/map-card'
import { Button } from '@/shared/components/button'
import { Typography } from '@/shared/components/typography'
import { MAPS_ROUTES } from '@/shared/config'

interface OverviewPageProps {
  maps: MapEntity[]
}

export const OverviewPage = ({ maps }: OverviewPageProps) => {
  const { t } = useTranslation()

  return (
    <div className='container mx-auto py-8 px-4 md:px-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <Typography variant='h1'>{t('dashboard.overview.title')}</Typography>
          <p className='text-muted-foreground mt-1'>{t('dashboard.overview.description')}</p>
        </div>
        <Button asChild>
          <Link to={MAPS_ROUTES.new}>
            <Plus className='mr-2 h-4 w-4' />
            {t('dashboard.overview.createMap')}
          </Link>
        </Button>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {maps.map(map => (
          <MapCard key={map.id} map={map} />
        ))}

        {/* Карточка создания новой карты */}
        <CreateMapCard />
      </div>
    </div>
  )
}
