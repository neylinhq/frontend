import type { LoaderFunctionArgs } from 'react-router'

import { mapApi } from '@/entities/map'
import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import { getCookieHeader } from '@/shared/lib/cookies'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('overview')
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookies = getCookieHeader(request)
  const initialData = await mapApi.getDashboardMaps({}, { cookies })
  return { initialData }
}

const DashboardOverviewRoute = () => {
  return <OverviewPage />
}

export default DashboardOverviewRoute
