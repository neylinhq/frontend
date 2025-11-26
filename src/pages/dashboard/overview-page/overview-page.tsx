import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { MapEntity } from '@/entities/map'
import { CreateMapCard } from '@/features/maps/create-map-button'
import { MapCard } from '@/features/maps/map-card/map-card'
import { Button } from '@/shared/ui/button'

interface OverviewPageProps {
  maps: MapEntity[]
}

export function OverviewPage({ maps }: OverviewPageProps) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.overview.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.overview.description')}</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/maps/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.overview.createMap')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {maps.map(map => (
          <MapCard key={map.id} map={map} />
        ))}

        {/* Карточка создания новой карты */}
        <CreateMapCard />
      </div>
    </div>
  )
}
