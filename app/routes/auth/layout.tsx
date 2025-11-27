import { Outlet } from 'react-router'

import { PublicHeader } from '@/shared/ui/public-header'

export default function AuthLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <PublicHeader hideAuthButtons />
      <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
