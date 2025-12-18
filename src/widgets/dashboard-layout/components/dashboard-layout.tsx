import { Menu } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/sheet'
import { useLocalStorage } from '@/shared/hooks/use-local-storage'
import { cn } from '@/shared/lib/cn'
import { Sidebar } from './sidebar'

const SIDEBAR_STORAGE_KEY = 'neylin-sidebar-expanded'

interface DashboardLayoutProps {
  /** Disable layout-level scroll for pages with their own scroll management (e.g., multi-pane layouts) */
  disableScroll?: boolean
  children: React.ReactNode
}

export const DashboardLayout = ({ disableScroll = false, children }: DashboardLayoutProps) => {
  const [isExpanded, setIsExpanded] = useLocalStorage(SIDEBAR_STORAGE_KEY, true)
  const { t } = useTranslation()

  const toggleSidebar = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [setIsExpanded])

  return (
    <div className='h-screen flex overflow-hidden'>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-card border-r flex-shrink-0 transition-[width] duration-200',
          isExpanded ? 'w-64' : 'w-16'
        )}
      >
        <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
      </aside>

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
