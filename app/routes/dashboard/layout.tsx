import { useEffect } from 'react'
import {
  type ClientLoaderFunctionArgs,
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useMatches
} from 'react-router'
import { useSessionStore } from '@/entities/session'
import { API_URL } from '@/shared/config/env'
import { DashboardLayout } from '@/widgets/dashboard-layout/ui/dashboard-layout'

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
  console.log('[Dashboard clientLoader] Starting...')
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      credentials: 'include'
    })
    console.log('[Dashboard clientLoader] Response status:', response.status)

    if (!response.ok) {
      const url = new URL(request.url)
      console.log('[Dashboard clientLoader] Not OK, redirecting to sign-in')
      throw redirect(`/auth/sign-in?from=${encodeURIComponent(url.pathname)}`)
    }

    const data = await response.json()
    console.log('[Dashboard clientLoader] User:', data.data)
    return { user: data.data }
  } catch (error) {
    console.error('[Dashboard clientLoader] Error:', error)
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
  const { user } = useLoaderData<typeof loader>()
  const setUser = useSessionStore(state => state.setUser)
  const matches = useMatches()

  // Check if any child route has disableScroll in handle
  const disableScroll = matches.some(
    match => (match.handle as { disableScroll?: boolean })?.disableScroll
  )

  // Гидратация стора данными с сервера
  useEffect(() => {
    if (user) {
      setUser(user)
    }
  }, [user, setUser])

  return (
    <DashboardLayout disableScroll={disableScroll}>
      <Outlet />
    </DashboardLayout>
  )
}

export default DashboardRoute
