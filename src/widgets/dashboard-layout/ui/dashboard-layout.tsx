import { useState } from 'react'
import { Outlet } from 'react-router'
import { DashboardHeader } from './dashboard-header'
import { Sidebar } from './sidebar'

export function DashboardLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <DashboardHeader />

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside
          className="hidden md:flex flex-col bg-card border-r flex-shrink-0 w-16 z-40"
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <Sidebar isExpanded={false} />
        </aside>

        {/* Expanded Sidebar Overlay - fixed position, doesn't affect layout */}
        {isSidebarExpanded && (
          <nav
            className="hidden md:flex flex-col fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-card border-r z-50 shadow-lg"
            onMouseEnter={() => setIsSidebarExpanded(true)}
            onMouseLeave={() => setIsSidebarExpanded(false)}
          >
            <Sidebar isExpanded={true} />
          </nav>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-y-auto [scrollbar-gutter:stable]">
          <div className="min-h-full border-r">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
