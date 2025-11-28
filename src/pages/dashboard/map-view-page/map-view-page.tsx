import type { FullMap } from '@/entities/map'
import { GraphVisualization } from '@/features/graph-visualization'

interface MapViewPageProps {
  map: FullMap
  mapId: string
}

export function MapViewPage({ map, mapId }: MapViewPageProps) {
  return (
    <div className='h-[calc(100vh-3.5rem)] p-2 md:p-4'>
      <GraphVisualization
        mapId={mapId}
        initialData={map}
        className='h-full w-full'
        interactive={true}
      />
    </div>
  )
}
