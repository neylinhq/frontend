import { Outlet } from 'react-router'

import { PublicFooter } from '@/shared/ui/public-footer'
import { PublicHeader } from '@/shared/ui/public-header'

export default function PublicLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <PublicHeader />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </div>
  )
}
