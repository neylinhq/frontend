import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useMatches
} from 'react-router'
import { API_URL } from '@/shared/config/env'
import { ErrorBoundary } from '@/shared/components/error-boundary'
import { DashboardLayout } from '@/widgets/dashboard-layout'

// Server-side loader (SSR, initial page load)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get('Cookie')

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
    return { user: data.data }
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
    const response = await fetch(`${API_URL}/users/me`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const url = new URL(request.url)
      throw redirect(`/auth/sign-in?from=${encodeURIComponent(url.pathname)}`)
    }

    const data = await response.json()
    return { user: data.data }
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
  const matches = useMatches()

  // Check if any child route has disableScroll in handle
  const disableScroll = matches.some(
    match => (match.handle as { disableScroll?: boolean })?.disableScroll
  )

  // User доступен через useLoaderUser() в любом дочернем компоненте
  // благодаря useMatches() — данные из loader уже есть, гидрация не нужна

  return (
    <DashboardLayout disableScroll={disableScroll}>
      <ErrorBoundary level='page'>
        <Outlet />
      </ErrorBoundary>
    </DashboardLayout>
  )
}

export default DashboardRoute
