import { Outlet, useMatches } from 'react-router'

import { PublicFooter } from '@/shared/ui/public-footer'
import { PublicHeader } from '@/shared/ui/public-header'

interface RouteHandle {
  hideFooter?: boolean
  bypassPublicLayout?: boolean
}

export default function PublicLayout() {
  const matches = useMatches()
  const hideFooter = matches.some((match) => (match.handle as RouteHandle)?.hideFooter === true)
  const bypassLayout = matches.some((match) => (match.handle as RouteHandle)?.bypassPublicLayout === true)

  // Docs routes handle their own layout
  if (bypassLayout) {
    return <Outlet />
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <PublicHeader />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        {!hideFooter && <PublicFooter />}
      </div>
    </div>
  )
}
