import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { NodeEditPage } from '@/pages/dashboard/node-edit-page'
import { getMeta } from '@/shared/lib/get-meta'

// Tell parent layout to disable scroll
export const handle = { disableScroll: true }

export const meta = () => {
  return getMeta('nodeEdit')
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { mapId, nodeId } = params
  if (!mapId || !nodeId) {
    throw new Response('Map ID and Node ID are required', { status: 400 })
  }

  const [node, map] = await Promise.all([
    mapApi.getNodeWithContent(nodeId),
    mapApi.getFullMap(mapId, false) // lightweight - no content
  ])

  if (!node || !map) {
    throw new Response('Node or Map not found', { status: 404 })
  }

  return { node, map, mapId, nodeId }
}

const NodeEditRoute = () => {
  const { node, map, mapId, nodeId } = useLoaderData<typeof loader>()

  return <NodeEditPage node={node} map={map} mapId={mapId} nodeId={nodeId} />
}

export default NodeEditRoute
