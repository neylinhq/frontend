import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import { Logo } from '@/shared/components/logo'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/sheet'
import { DASHBOARD_ROUTES } from '@/shared/config'
import { UserNav } from '@/widgets/user-nav'
import { Sidebar } from './sidebar'

export const DashboardHeader = () => {
  const { t } = useTranslation()

  return (
    <header className='sticky top-0 z-30 h-14 border-b bg-background'>
      <div className='flex h-full items-center justify-between px-4 gap-4'>
        {/* Left: Menu + Logo */}
        <div className='flex items-center gap-3'>
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden -ml-2'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>{t('nav.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-64'>
              <SheetTitle className='sr-only'>{t('nav.menu')}</SheetTitle>
              <Sidebar className='h-full border-none' isExpanded={true} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Logo size='sm' href={DASHBOARD_ROUTES.overview} />
        </div>

        {/* Right: User Nav */}
        <UserNav />
      </div>
    </header>
  )
}
