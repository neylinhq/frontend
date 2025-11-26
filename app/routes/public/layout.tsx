import { Outlet } from 'react-router'

import { PublicFooter } from '@/shared/ui/public-footer'
import { PublicHeader } from '@/shared/ui/public-header'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
