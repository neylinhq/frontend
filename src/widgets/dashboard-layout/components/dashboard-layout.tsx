import { Menu } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/sheet'
import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  /** Disable layout-level scroll for pages with their own scroll management (e.g., multi-pane layouts) */
  disableScroll?: boolean
  children: React.ReactNode
}

export const DashboardLayout = ({ disableScroll = false, children }: DashboardLayoutProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const { t } = useTranslation()

  return (
    <div className='h-screen flex overflow-hidden'>
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
          className='hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-card border-r z-50'
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <Sidebar isExpanded={true} />
        </nav>
      )}

      {/* Main Content */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile Header */}
        <header className='md:hidden h-14 flex items-center px-4 border-b bg-background'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='-ml-2'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>{t('nav.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-64'>
              <Sidebar className='h-full border-none' isExpanded={true} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Content */}
        {disableScroll ? (
          <div className='flex-1 min-h-0'>{children}</div>
        ) : (
          <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable]'>
            <div className='min-h-full'>{children}</div>
          </div>
        )}
      </div>
    </div>
  )
}
