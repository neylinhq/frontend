import { useEffect } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { NodeEditPage } from '@/pages/dashboard/node-edit-page'
import { getMeta } from '@/shared/lib/get-meta'
import { useDashboardContext } from '../../layout'

export function meta() {
  return getMeta('nodeEdit')
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { mapId, nodeId } = params
  if (!mapId || !nodeId) {
    throw new Response('Map ID and Node ID are required', { status: 400 })
  }

  const [node, map] = await Promise.all([
    mapApi.getNodeWithContent(nodeId),
    mapApi.getFullMap(mapId, false) // lightweight - no content
  ])

  return { node, map, mapId, nodeId }
}

export default function NodeEditRoute() {
  const { node, map, mapId, nodeId } = useLoaderData<typeof loader>()
  const { setDisableScroll } = useDashboardContext()

  // Disable layout scroll - this page has its own scroll management
  useEffect(() => {
    setDisableScroll(true)
    return () => setDisableScroll(false)
  }, [setDisableScroll])

  return <NodeEditPage node={node} map={map} mapId={mapId} nodeId={nodeId} />
}
