import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useFullMap } from '@/entities/map'
import { GraphVisualization } from '@/features/graph-visualization'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

export function MapViewPage() {
  const { t } = useTranslation()
  const { mapId } = useParams<{ mapId: string }>()
  const { data: fullMap, isLoading, isError } = useFullMap(mapId || '')

  if (!mapId) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-destructive mb-2">{t('mapView.navigationError')}</h2>
          <p className="text-muted-foreground">{t('mapView.mapIdMissing')}</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-semibold">{t('mapView.loadingTitle')}</h3>
            <p className="text-muted-foreground">{t('mapView.loadingMessage')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !fullMap) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">{t('mapView.notFoundTitle')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('mapView.notFoundMessage')}
          </p>
          <Button asChild>
            <Link to="/dashboard/overview">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.backToOverview')}
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] p-2 md:p-4">
      <GraphVisualization mapId={mapId} className="h-full w-full" interactive={true} />
    </div>
  )
}
