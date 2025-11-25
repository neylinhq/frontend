import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('overview')
}

export default function DashboardOverviewRoute() {
  return <OverviewPage />
}
