import { type LoaderFunctionArgs, redirect } from 'react-router'
import { getSession } from '@/entities/session/session.server'
import { MapCreationPage } from '@/pages/dashboard/map-creation-page/map-creation-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('mapCreation')
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request)

  if (!session) {
    return redirect('/auth/sign-in')
  }

  return { session }
}

const MapCreationRoute = () => {
  return <MapCreationPage />
}

export default MapCreationRoute
