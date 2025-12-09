import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData
} from 'react-router'
import { mapApi } from '@/entities/map'
import { NodeEditPage, SIDEBAR_COOKIE_KEY } from '@/pages/dashboard/node-edit-page'
import { getMeta } from '@/shared/lib/get-meta'
import { ApiError } from '@/shared/api/client'
import { getCookie, getCookies } from '@/shared/api/server'

// Tell parent layout to disable scroll
export const handle = { disableScroll: true }

export const meta = () => {
  return getMeta('nodeEdit')
}

// Server-side loader
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { mapId, nodeId } = params
  if (!mapId || !nodeId) {
    throw new Response('Map ID and Node ID are required', { status: 400 })
  }

  const cookies = getCookies(request)

  // Read sidebar state from cookie (default: true)
  const cookieHeader = request.headers.get('Cookie') ?? ''
  const sidebarCookie = getCookie(cookieHeader, SIDEBAR_COOKIE_KEY)
  const sidebarOpen = sidebarCookie !== 'false' // Default to true

  try {
    const [node, map] = await Promise.all([
      mapApi.getNodeWithContent(mapId, nodeId, { cookies }),
      mapApi.getFullMap(mapId, { cookies })
    ])

    if (!node || !map) {
      throw new Response('Node or Map not found', { status: 404 })
    }

    return { node, map, mapId, nodeId, sidebarOpen }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw redirect(`/auth/sign-in?from=${encodeURIComponent(request.url)}`)
    }

    console.error('fetchNodeData error:', error)
    throw new Response('Node or Map not found', { status: 404 })
  }
}

// Client-side loader
export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  const { mapId, nodeId } = params
  if (!mapId || !nodeId) {
    throw new Response('Map ID and Node ID are required', { status: 400 })
  }

  // Read sidebar state from cookie on client
  const sidebarCookie = getCookie(document.cookie, SIDEBAR_COOKIE_KEY)
  const sidebarOpen = sidebarCookie !== 'false'

  try {
    const [node, map] = await Promise.all([
      mapApi.getNodeWithContent(mapId, nodeId),
      mapApi.getFullMap(mapId)
    ])

    if (!node || !map) {
      throw new Response('Node or Map not found', { status: 404 })
    }

    return { node, map, mapId, nodeId, sidebarOpen }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw redirect('/auth/sign-in')
    }
    throw new Response('Node or Map not found', { status: 404 })
  }
}

// hydrate = false means clientLoader only runs on client-side navigation,
// not during initial hydration (SSR data is already available)
clientLoader.hydrate = false as const

const NodeEditRoute = () => {
  const { node, map, mapId, nodeId, sidebarOpen } = useLoaderData<typeof loader>()

  return <NodeEditPage node={node} map={map} mapId={mapId} nodeId={nodeId} initialSidebarOpen={sidebarOpen} />
}

export default NodeEditRoute
