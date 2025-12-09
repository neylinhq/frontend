import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('overview')
}

const DashboardOverviewRoute = () => {
  return <OverviewPage />
}

export default DashboardOverviewRoute
