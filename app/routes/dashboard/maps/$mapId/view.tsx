import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData
} from 'react-router'
import { mapApi } from '@/entities/map'
import { MapPage } from '@/pages/dashboard/map-page'
import { getMeta } from '@/shared/lib/get-meta'
import { ApiError } from '@/shared/api/client'
import { getCookies } from '@/shared/api/server'

export const meta = () => {
  return getMeta('mapView')
}

// Server-side loader
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const mapId = params.mapId
  if (!mapId) {
    throw new Response('Map ID is required', { status: 400 })
  }

  try {
    const map = await mapApi.getFullMap(mapId, { cookies: getCookies(request) })

    if (!map) {
      throw new Response('Map not found', { status: 404 })
    }
    return { map, mapId }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw redirect(`/auth/sign-in?from=${encodeURIComponent(request.url)}`)
    }

    throw new Response('Map not found', { status: 404 })
  }
}

// Client-side loader - use server data on initial load, fetch on client navigation
export const clientLoader = async ({ params, serverLoader }: ClientLoaderFunctionArgs) => {
  const mapId = params.mapId
  if (!mapId) {
    throw new Response('Map ID is required', { status: 400 })
  }

  // On hydration, use server loader data (has edges from SSR)
  const serverData = await serverLoader<typeof loader>()
  if (serverData?.map) {
    return serverData
  }

  // Client-side navigation - fetch fresh data
  try {
    const map = await mapApi.getFullMap(mapId)
    if (!map) {
      throw new Response('Map not found', { status: 404 })
    }
    return { map, mapId }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw redirect('/auth/sign-in')
    }
    throw new Response('Map not found', { status: 404 })
  }
}

clientLoader.hydrate = true

// Disable layout scroll - ReactFlow needs full height container
export const handle = { disableScroll: true }

const MapViewRoute = () => {
  const { map, mapId } = useLoaderData<typeof loader>()
  return <MapPage map={map} mapId={mapId} />
}

export default MapViewRoute
