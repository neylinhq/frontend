import { Menu01Icon } from '@untitledui/icons-react/outline'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/sheet'
import { cn } from '@/shared/lib/cn'
import { useDashboardSidebarStore } from '@/shared/store'

import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  /** Disable layout-level scroll for pages with their own scroll management (e.g., multi-pane layouts) */
  disableScroll?: boolean
  /** Initial sidebar state from SSR (read from cookie) */
  defaultExpanded?: boolean
  /** Sidebar positioning: 'push' (default) shrinks content, 'cover' overlays content */
  sidebarMode?: 'push' | 'cover'
  children: React.ReactNode
}

export const DashboardLayout = ({
  disableScroll = false,
  defaultExpanded = true,
  sidebarMode = 'push',
  children
}: DashboardLayoutProps) => {
  const { isExpanded, toggleSidebar } = useDashboardSidebarStore()
  const { t } = useTranslation()

  useEffect(() => {
    if (defaultExpanded !== undefined) {
      useDashboardSidebarStore.setState({ isExpanded: defaultExpanded })
    }
  }, [])

  const isCover = sidebarMode === 'cover'

  return (
    <div className='h-screen flex overflow-hidden'>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-card border-r flex-shrink-0 z-(--z-sticky) transition-[width]',
          'duration-[var(--sidebar-transition)]',
          isExpanded ? 'w-(--sidebar-width-expanded)' : 'w-(--sidebar-width-collapsed)',
          isCover && 'absolute left-0 top-0 bottom-0'
        )}
      >
        <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
      </aside>

      {/* Main Content */}
      <div
        className={cn('flex-1 flex flex-col min-w-0', isCover && 'w-full')}
        style={isCover ? { '--dashboard-sidebar-offset': `var(--sidebar-width-${isExpanded ? 'expanded' : 'collapsed'})` } as React.CSSProperties : undefined}
      >
        {/* Mobile Header */}
        <header className='md:hidden h-14 flex items-center px-4 border-b bg-background'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='-ml-2'>
                <Menu01Icon className='h-5 w-5' />
                <span className='sr-only'>{t('nav.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-64'>
              <SheetTitle className='sr-only'>{t('nav.menu')}</SheetTitle>
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
