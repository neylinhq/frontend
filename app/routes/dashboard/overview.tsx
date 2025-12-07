import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData
} from 'react-router'
import { mapApi } from '@/entities/map'
import { OverviewPage } from '@/pages/dashboard/overview-page/overview-page'
import { getMeta } from '@/shared/lib/get-meta'
import { getCookies } from '@/shared/api/api.server'

export const meta = () => {
  return getMeta('overview')
}

// Server-side loader
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookies = getCookies(request)

  try {
    const { maps } = await mapApi.getMaps(20, 0, { cookies })
    return { maps }
  } catch {
    throw redirect('/auth/sign-in')
  }
}

// Client-side loader
export const clientLoader = async (_args: ClientLoaderFunctionArgs) => {
  try {
    const { maps } = await mapApi.getMaps(20, 0)
    return { maps }
  } catch {
    throw redirect('/auth/sign-in')
  }
}

clientLoader.hydrate = true

const DashboardOverviewRoute = () => {
  const { maps } = useLoaderData<typeof loader>()
  return <OverviewPage maps={maps} />
}

export default DashboardOverviewRoute
