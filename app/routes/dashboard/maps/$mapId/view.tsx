import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { MapViewPage } from '@/pages/dashboard/map-view-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('mapView')
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const mapId = params.mapId
  if (!mapId) {
    throw new Response('Map ID is required', { status: 400 })
  }
  const map = await mapApi.getFullMap(mapId, true)
  if (!map) {
    throw new Response('Map not found', { status: 404 })
  }
  return { map, mapId }
}

const MapViewRoute = () => {
  const { map, mapId } = useLoaderData<typeof loader>()
  return <MapViewPage map={map} mapId={mapId} />
}

export default MapViewRoute
