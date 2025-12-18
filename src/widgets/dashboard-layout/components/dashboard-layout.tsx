import { MobileMenuTrigger, Sidebar } from './sidebar'
import { SidebarProvider } from '../sidebar-context'

interface DashboardLayoutProps {
  /** Disable layout-level scroll for pages with their own scroll management (e.g., multi-pane layouts) */
  disableScroll?: boolean
  children: React.ReactNode
}

export const DashboardLayout = ({ disableScroll = false, children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className='h-screen flex overflow-hidden'>
        {/* Desktop Sidebar */}
        <aside className='hidden md:flex flex-shrink-0'>
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className='flex-1 flex flex-col min-w-0'>
          {/* Mobile Header - only shows menu trigger */}
          <header className='md:hidden flex items-center h-14 px-4 border-b bg-background shrink-0'>
            <MobileMenuTrigger />
          </header>

          {/* Content */}
          {disableScroll ? (
            // Page manages its own scroll - just pass through height
            <main className='flex-1 min-h-0'>{children}</main>
          ) : (
            // Layout manages scroll
            <main className='flex-1 overflow-y-auto [scrollbar-gutter:stable]'>
              <div className='min-h-full'>{children}</div>
            </main>
          )}
        </div>
      </div>
    </SidebarProvider>
  )
}
