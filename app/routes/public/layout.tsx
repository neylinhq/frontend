import type { ClientLoaderFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { Outlet, useMatches } from 'react-router'
import { API_URL } from '@/shared/config/env'
import { PublicFooter } from '@/shared/components/public-footer'
import { cn } from '@/shared/lib/cn'
import { PublicHeader } from '@/widgets/public-header'

// Server-side loader (SSR) - try to get user, but don't redirect if not authenticated
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get('Cookie')

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    if (!response.ok) {
      return { user: null }
    }

    const data = await response.json()
    return { user: data.data }
  } catch {
    return { user: null }
  }
}

// Client-side loader
export const clientLoader = async () => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      credentials: 'include'
    })

    if (!response.ok) {
      return { user: null }
    }

    const data = await response.json()
    return { user: data.data }
  } catch {
    return { user: null }
  }
}

clientLoader.hydrate = true

interface RouteHandle {
  hideFooter?: boolean
  centered?: boolean
  bypassPublicLayout?: boolean
}

const PublicLayout = () => {
  const matches = useMatches()

  const getHandle = (key: keyof RouteHandle) =>
    matches.some(match => (match.handle as RouteHandle)?.[key] === true)

  const hideFooter = getHandle('hideFooter')
  const centered = getHandle('centered')
  const bypassLayout = getHandle('bypassPublicLayout')

  // Docs routes handle their own layout
  if (bypassLayout) {
    return <Outlet />
  }

  return (
    <div className='h-screen flex flex-col overflow-hidden bg-background text-foreground'>
      <PublicHeader />
      <div className='flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]'>
        <div
          className={cn(
            'min-h-full flex flex-col border-r',
            centered && 'items-center justify-center p-8'
          )}
        >
          {centered ? (
            <div className='w-full max-w-sm'>
              <Outlet />
            </div>
          ) : (
            <>
              <main className='flex-1'>
                <Outlet />
              </main>
              {!hideFooter && <PublicFooter />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicLayout
