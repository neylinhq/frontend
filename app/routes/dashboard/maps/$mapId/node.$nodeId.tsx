import { NodeEditPage } from '@/pages/dashboard/node-edit-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('nodeEdit')
}

export default function NodeEditRoute() {
  return <NodeEditPage />
}
