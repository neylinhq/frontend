import { Copy, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useCopyMap } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { useToast } from '@/shared/components/toast'

interface ReadOnlyBannerProps {
  mapId: string
}

export const ReadOnlyBanner = ({ mapId }: ReadOnlyBannerProps) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const copyMap = useCopyMap()
  const navigate = useNavigate()

  const handleCopy = async () => {
    try {
      const newMap = await copyMap.mutateAsync(mapId)
      toast({ title: t('dashboard.mapCard.copySuccess') })
      navigate(`/dashboard/maps/${newMap.id}`)
    } catch {
      toast({ title: t('dashboard.mapCard.copyError'), variant: 'error' })
    }
  }

  return (
    <div className='absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-muted/90 backdrop-blur px-4 py-2 rounded-full shadow-sm'>
      <Eye className='h-4 w-4 text-muted-foreground' />
      <span className='text-sm'>{t('mapView.viewOnly')}</span>
      <Button size='sm' variant='secondary' onClick={handleCopy} disabled={copyMap.isPending}>
        <Copy className='h-3 w-3 mr-1.5' />
        {t('dashboard.mapCard.copyToMyMaps')}
      </Button>
    </div>
  )
}
