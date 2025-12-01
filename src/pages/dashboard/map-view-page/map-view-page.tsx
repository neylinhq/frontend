import type { FullMap } from '@/entities/map'
import { GraphView } from '@/widgets/graph-view'

interface MapViewPageProps {
  map: FullMap
  mapId: string
}

export const MapViewPage = ({ map, mapId }: MapViewPageProps) => {
  return (
    <div className='h-[calc(100vh-3.5rem)] p-2 md:p-4'>
      <GraphView mapId={mapId} initialData={map} className='h-full w-full' interactive={true} />
    </div>
  )
}
