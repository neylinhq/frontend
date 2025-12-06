import type { LoaderFunctionArgs } from 'react-router'
import { data, useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { getSession } from '@/entities/session/session.server'
import { refreshSession } from '@/entities/session/refresh-session.server'
import { NodeEditPage } from '@/pages/dashboard/node-edit-page'
import { getMeta } from '@/shared/lib/get-meta'
import { ApiError } from '@/shared/api/api-client'

// Tell parent layout to disable scroll
export const handle = { disableScroll: true }

export const meta = () => {
  return getMeta('nodeEdit')
}

async function fetchNodeData(mapId: string, nodeId: string, token?: string) {
  const [node, map] = await Promise.all([
    mapApi.getNodeWithContent(mapId, nodeId, { token }),
    mapApi.getFullMap(mapId, { token })
  ])

  if (!node || !map) {
    throw new Response('Node or Map not found', { status: 404 })
  }

  return { node, map }
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { mapId, nodeId } = params
  if (!mapId || !nodeId) {
    throw new Response('Map ID and Node ID are required', { status: 400 })
  }

  const session = await getSession(request)

  try {
    const { node, map } = await fetchNodeData(mapId, nodeId, session?.token)
    return { node, map, mapId, nodeId }
  } catch (error) {
    // If 401/403, try to refresh token and retry
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      try {
        const { session: newSession, cookie } = await refreshSession(request)
        const { node, map } = await fetchNodeData(mapId, nodeId, newSession.token)

        return data({ node, map, mapId, nodeId }, { headers: { 'Set-Cookie': cookie } })
      } catch (refreshError) {
        throw refreshError
      }
    }

    console.error('fetchNodeData error:', error)
    throw new Response('Node or Map not found', { status: 404 })
  }
}

const NodeEditRoute = () => {
  const { node, map, mapId, nodeId } = useLoaderData<typeof loader>()

  return <NodeEditPage node={node} map={map} mapId={mapId} nodeId={nodeId} />
}

export default NodeEditRoute
