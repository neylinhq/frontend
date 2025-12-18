import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useMatches
} from 'react-router'
import { API_URL } from '@/shared/config/env'
import { getCookie } from '@/shared/api/server'
import { ErrorBoundary } from '@/shared/components/error-boundary'
import { DashboardLayout, SIDEBAR_STORAGE_KEY } from '@/widgets/dashboard-layout'

// Server-side loader (SSR, initial page load)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get('Cookie') ?? ''

  // Read sidebar state from cookie for SSR
  const sidebarCookie = getCookie(cookieHeader, SIDEBAR_STORAGE_KEY)
  const sidebarExpanded = sidebarCookie ? sidebarCookie === 'true' : true

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    if (!response.ok) {
      const url = new URL(request.url)
      throw redirect(`/auth/sign-in?from=${encodeURIComponent(url.pathname)}`)
    }

    const data = await response.json()
    return { user: data.data, sidebarExpanded }
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    const url = new URL(request.url)
    throw redirect(`/auth/sign-in?from=${encodeURIComponent(url.pathname)}`)
  }
}

// Helper to read cookie on client
const getClientCookie = (name: string): string | undefined =>
  document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${name}=`))
    ?.split('=')[1]
    ?.trim()

// Client-side loader (client navigation after login)
export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  // Read sidebar state from cookie
  const sidebarCookie = getClientCookie(SIDEBAR_STORAGE_KEY)
  const sidebarExpanded = sidebarCookie ? sidebarCookie === 'true' : true

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const url = new URL(request.url)
      throw redirect(`/auth/sign-in?from=${encodeURIComponent(url.pathname)}`)
    }

    const data = await response.json()
    return { user: data.data, sidebarExpanded }
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    const url = new URL(request.url)
    throw redirect(`/auth/sign-in?from=${encodeURIComponent(url.pathname)}`)
  }
}

// Enable client loader to run instead of server loader on client navigation
clientLoader.hydrate = true

const DashboardRoute = () => {
  const { sidebarExpanded } = useLoaderData<typeof loader>()
  const matches = useMatches()

  // Check if any child route has disableScroll in handle
  const disableScroll = matches.some(
    match => (match.handle as { disableScroll?: boolean })?.disableScroll
  )

  return (
    <DashboardLayout disableScroll={disableScroll} defaultExpanded={sidebarExpanded}>
      <ErrorBoundary level='page'>
        <Outlet />
      </ErrorBoundary>
    </DashboardLayout>
  )
}

export default DashboardRoute
