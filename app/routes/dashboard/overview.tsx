import { type LoaderFunctionArgs, redirect, useLoaderData } from 'react-router'
import { mapApi } from '@/entities/map'
import { getSession } from '@/entities/session/session.server'
import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('overview')
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request)

  if (!session) {
    return redirect('/sign-in')
  }

  const maps = await mapApi.getMaps(20, 0, { token: session.token })
  return { maps }
}

const DashboardOverviewRoute = () => {
  const { maps } = useLoaderData<typeof loader>()
  return <OverviewPage maps={maps} />
}

export default DashboardOverviewRoute
