import { useState } from 'react'
import { Outlet } from 'react-router'
import { DashboardHeader } from './dashboard-header'
import { Sidebar } from './sidebar'

export function DashboardLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <DashboardHeader />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className="hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] bg-card border-r flex-shrink-0 w-16 z-40"
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <Sidebar isExpanded={false} />
        </aside>

        {/* Expanded Sidebar Overlay - fixed position, doesn't affect layout */}
        {isSidebarExpanded && (
          <nav
            className="hidden md:block fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-card border-r z-50 shadow-lg"
            onMouseEnter={() => setIsSidebarExpanded(true)}
            onMouseLeave={() => setIsSidebarExpanded(false)}
          >
            <Sidebar isExpanded={true} />
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
