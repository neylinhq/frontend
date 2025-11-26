import { Outlet } from 'react-router'

import { PublicHeader } from '@/shared/ui/public-header'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader hideAuthButtons />
      <main className="flex-1 pt-14 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
