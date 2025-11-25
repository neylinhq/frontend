import { Menu } from 'lucide-react'
import { Outlet } from 'react-router'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet'
import { Sidebar } from './ui/sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center h-14 border-b px-4 bg-card sticky top-0 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Меню</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar className="h-full border-none" />
          </SheetContent>
        </Sheet>
        <div className="font-semibold tracking-tight ml-2">Arbor</div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col sticky top-0 h-screen">
        <Sidebar className="border-none" />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
