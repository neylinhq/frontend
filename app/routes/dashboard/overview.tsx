import { useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('overview')
}

export const loader = async () => {
  const maps = await mapApi.getMaps()
  return { maps }
}

const DashboardOverviewRoute = () => {
  const { maps } = useLoaderData<typeof loader>()
  return <OverviewPage maps={maps} />
}

export default DashboardOverviewRoute
