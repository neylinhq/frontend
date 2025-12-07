import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData
} from 'react-router'
import { mapApi } from '@/entities/map'
import { NodeEditPage } from '@/pages/dashboard/node-edit-page'
import { getMeta } from '@/shared/lib/get-meta'
import { ApiError } from '@/shared/api/api-client'
import { getCookies } from '@/shared/api/api.server'

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

  try {
    const [node, map] = await Promise.all([
      mapApi.getNodeWithContent(mapId, nodeId, { cookies }),
      mapApi.getFullMap(mapId, { cookies })
    ])

    if (!node || !map) {
      throw new Response('Node or Map not found', { status: 404 })
    }

    return { node, map, mapId, nodeId }
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

  try {
    const [node, map] = await Promise.all([
      mapApi.getNodeWithContent(mapId, nodeId),
      mapApi.getFullMap(mapId)
    ])

    if (!node || !map) {
      throw new Response('Node or Map not found', { status: 404 })
    }

    return { node, map, mapId, nodeId }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw redirect('/auth/sign-in')
    }
    throw new Response('Node or Map not found', { status: 404 })
  }
}

clientLoader.hydrate = true

const NodeEditRoute = () => {
  const { node, map, mapId, nodeId } = useLoaderData<typeof loader>()

  return <NodeEditPage node={node} map={map} mapId={mapId} nodeId={nodeId} />
}

export default NodeEditRoute
