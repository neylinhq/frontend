import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { MapViewPage } from '@/pages/dashboard/map-view-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('mapView')
}

export async function loader({ params }: LoaderFunctionArgs) {
  const mapId = params.mapId
  if (!mapId) {
    throw new Response('Map ID is required', { status: 400 })
  }
  const map = await mapApi.getFullMap(mapId, true)
  return { map, mapId }
}

export default function MapViewRoute() {
  const { map, mapId } = useLoaderData<typeof loader>()
  return <MapViewPage map={map} mapId={mapId} />
}
