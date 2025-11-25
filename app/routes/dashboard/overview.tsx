import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import type { Route } from './+types/overview'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Arbor - Обзор' }, { name: 'description', content: 'Ваши карты знаний' }]
}

export default function DashboardOverviewRoute() {
  return <OverviewPage />
}
