import { MapCreationPage } from '@/pages/dashboard/map-creation-page/map-creation-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('mapCreation')
}

const MapCreationRoute = () => {
  return <MapCreationPage />
}

export default MapCreationRoute
