import { GraphWorkspace } from '@/widgets/graph-workspace'
import { useMapPermissions } from '@/features/map-permissions'
import type { FullMap } from '@/entities/map'

interface MapPageProps {
  map: FullMap
  mapId: string
}

export const MapPage = ({ map, mapId }: MapPageProps) => {
  const { canEdit } = useMapPermissions(map)

  return (
    <GraphWorkspace
      mapId={mapId}
      data={map}
      readOnly={!canEdit}
      className='h-screen'
    />
  )
}
