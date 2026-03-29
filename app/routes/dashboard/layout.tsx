import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useMatches
} from 'react-router'

import { DashboardLayout } from '@/widgets/dashboard-layout'
import { ErrorBoundary } from '@/shared/components/error-boundary'
import { API_URL } from '@/shared/config/env'
import { getCookie, getCookieHeader, parseCookieHeader } from '@/shared/lib/cookies'
const SIDEBAR_STORAGE_KEY = 'neylin-sidebar-expanded'

// Server-side loader (SSR, initial page load)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = getCookieHeader(request)

  // Read sidebar state from cookie for SSR
  const sidebarCookie = parseCookieHeader(cookieHeader, SIDEBAR_STORAGE_KEY)
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

// Client-side loader (client navigation after login)
export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  try {
    const sidebarCookie = getCookie(SIDEBAR_STORAGE_KEY)
    const sidebarExpanded = sidebarCookie ? sidebarCookie === 'true' : true

    const response = await fetch(`${API_URL}/users/me`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const url = new URL(request.url)
      throw redirect(`/auth/sign-in?from=${encodeURIComponent(url.pathname)}`)
    }

    const data = await response.json()
    return { user: data.data, defaultExpanded: sidebarExpanded }
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

  const disableScroll = matches.some(
    match => (match.handle as { disableScroll?: boolean })?.disableScroll
  )
  const sidebarMode = matches.some(
    match => (match.handle as { sidebarMode?: string })?.sidebarMode === 'cover'
  ) ? 'cover' as const : 'push' as const

  return (
    <DashboardLayout disableScroll={disableScroll} defaultExpanded={sidebarExpanded} sidebarMode={sidebarMode}>
      <ErrorBoundary level='page'>
        <Outlet />
      </ErrorBoundary>
    </DashboardLayout>
  )
}

export default DashboardRoute
