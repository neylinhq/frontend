import { useState } from 'react'
import { Outlet } from 'react-router'
import { DashboardHeader } from './dashboard-header'
import { Sidebar } from './sidebar'

export function DashboardLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  const handleSidebarMouseEnter = () => {
    setIsSidebarExpanded(true)
  }

  const handleSidebarMouseLeave = () => {
    setIsSidebarExpanded(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <DashboardHeader />

      <div className="flex">
        {/* Desktop Sidebar - Collapsed in flow, expanded overlay */}
        <aside
          className="hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] bg-card flex-shrink-0 w-16 z-50"
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <div className="relative w-full h-full">
            {/* Expanded overlay */}
            {isSidebarExpanded && (
              <div className="absolute left-0 top-0 h-full w-60 bg-card border-r z-[100] shadow-lg">
                <Sidebar isExpanded={true} />
              </div>
            )}
            {/* Collapsed sidebar */}
            {!isSidebarExpanded && <Sidebar isExpanded={false} />}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
