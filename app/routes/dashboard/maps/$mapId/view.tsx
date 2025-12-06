import type { LoaderFunctionArgs } from 'react-router'
import { data, useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { getSession } from '@/entities/session/session.server'
import { refreshSession } from '@/entities/session/refresh-session.server'
import { MapViewPage } from '@/pages/dashboard/map-view-page'
import { getMeta } from '@/shared/lib/get-meta'
import { ApiError } from '@/shared/api/api-client'

export const meta = () => {
  return getMeta('mapView')
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const mapId = params.mapId
  if (!mapId) {
    throw new Response('Map ID is required', { status: 400 })
  }

  const session = await getSession(request)

  try {
    const map = await mapApi.getFullMap(mapId, { token: session?.token })

    if (!map) {
      throw new Response('Map not found', { status: 404 })
    }
    return { map, mapId }
  } catch (error) {
    // If 401/403, try to refresh token and retry
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      try {
        const { session: newSession, cookie } = await refreshSession(request)
        const map = await mapApi.getFullMap(mapId, { token: newSession.token })

        if (!map) {
          throw new Response('Map not found', { status: 404 })
        }

        // Return data with Set-Cookie header to update session
        return data({ map, mapId }, { headers: { 'Set-Cookie': cookie } })
      } catch (refreshError) {
        // refreshSession throws redirect to sign-in on failure
        throw refreshError
      }
    }

    console.error('getFullMap error:', error)
    throw new Response('Map not found', { status: 404 })
  }
}

const MapViewRoute = () => {
  const { map, mapId } = useLoaderData<typeof loader>()
  return <MapViewPage map={map} mapId={mapId} />
}

export default MapViewRoute
