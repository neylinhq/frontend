import { useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('overview')
}

export async function loader() {
  const maps = await mapApi.getMaps()
  return { maps }
}

export default function DashboardOverviewRoute() {
  const { maps } = useLoaderData<typeof loader>()
  return <OverviewPage maps={maps} />
}
