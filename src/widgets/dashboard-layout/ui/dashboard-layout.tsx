import { useState } from 'react'
import { DashboardHeader } from './dashboard-header'
import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  /** Disable layout-level scroll for pages with their own scroll management (e.g., multi-pane layouts) */
  disableScroll?: boolean
  children: React.ReactNode
}

export const DashboardLayout = ({ disableScroll = false, children }: DashboardLayoutProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  return (
    <div className='h-screen flex flex-col overflow-hidden'>
      {/* Header */}
      <DashboardHeader />
      <div className='flex flex-1 min-h-0'>
        {/* Desktop Sidebar */}
        <aside
          className='hidden md:flex flex-col bg-card border-r flex-shrink-0 w-16 z-40'
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <Sidebar isExpanded={false} />
        </aside>

        {/* Expanded Sidebar Overlay - fixed position, doesn't affect layout */}
        {isSidebarExpanded && (
          <nav
            className='hidden md:flex flex-col fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-card border-r z-50 shadow-lg'
            onMouseEnter={() => setIsSidebarExpanded(true)}
            onMouseLeave={() => setIsSidebarExpanded(false)}
          >
            <Sidebar isExpanded={true} />
          </nav>
        )}

        {/* Main Content */}
        {disableScroll ? (
          // Page manages its own scroll - just pass through height
          <div className='flex-1 min-w-0 min-h-0'>{children}</div>
        ) : (
          // Layout manages scroll
          <div className='flex-1 min-w-0 overflow-y-auto [scrollbar-gutter:stable]'>
            <div className='min-h-full border-r'>{children}</div>
          </div>
        )}
      </div>
    </div>
  )
}
