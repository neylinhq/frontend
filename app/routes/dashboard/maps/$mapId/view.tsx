import { MapViewPage } from '@/pages/dashboard/map-view-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('mapView')
}

export default function MapViewRoute() {
  return <MapViewPage />
}
