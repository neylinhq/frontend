import { Outlet, useMatches } from 'react-router'

import { cn } from '@/shared/lib/cn'
import { PublicFooter } from '@/shared/ui/public-footer'
import { PublicHeader } from '@/shared/ui/public-header'

interface RouteHandle {
  hideFooter?: boolean
  hideAuthButtons?: boolean
  centered?: boolean
  bypassPublicLayout?: boolean
}

const PublicLayout = () => {
  const matches = useMatches()

  const getHandle = (key: keyof RouteHandle) =>
    matches.some(match => (match.handle as RouteHandle)?.[key] === true)

  const hideFooter = getHandle('hideFooter')
  const hideAuthButtons = getHandle('hideAuthButtons')
  const centered = getHandle('centered')
  const bypassLayout = getHandle('bypassPublicLayout')

  // Docs routes handle their own layout
  if (bypassLayout) {
    return <Outlet />
  }

  return (
    <div className='h-screen flex flex-col overflow-hidden bg-background text-foreground'>
      <PublicHeader hideAuthButtons={hideAuthButtons} />
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
