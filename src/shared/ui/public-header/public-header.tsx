import type { LucideIcon } from 'lucide-react'
import { Home, LogIn, Menu, Rocket, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'
import { ModeSelect } from '@/app/theme/components/mode-select'
import { PaletteSelect } from '@/app/theme/components/palette-select'
import { LanguageSelect } from '@/shared/ui/language-switcher'
import { AUTH_ROUTES, ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'
import { Separator } from '@/shared/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet'

interface PublicHeaderProps {
  hideAuthButtons?: boolean
}

export function PublicHeader({ hideAuthButtons }: PublicHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className='h-14 flex-shrink-0 border-b bg-background'>
      <div className='max-w-5xl mx-auto px-4 md:px-6 h-full flex items-center justify-between'>
        <Logo size='lg' />

        <nav className='flex items-center gap-2'>
          {/* Desktop theme controls */}
          <div className='hidden md:flex items-center gap-2'>
            <LanguageSelect compact />
            <PaletteSelect compact />
            <ModeSelect compact />
          </div>

          {/* Desktop auth buttons */}
          {!hideAuthButtons && (
            <>
              <div className='hidden md:block h-4 w-px bg-border mx-1' />
              <Button asChild variant='ghost' size='sm' className='hidden md:inline-flex'>
                <Link to={AUTH_ROUTES.signIn}>{t('home.cta.signIn', 'Sign in')}</Link>
              </Button>
              <Button asChild size='sm' className='hidden md:inline-flex'>
                <Link to={AUTH_ROUTES.signUp}>{t('home.cta.getStarted', 'Get Started')}</Link>
              </Button>
            </>
          )}

          {/* Mobile menu - always visible */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>{t('common.menu', 'Menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-[280px] p-0 flex flex-col'>
              <div className='py-4 px-6 border-b'>
                <Logo size='sm' />
              </div>

              {/* Navigation */}
              <div className='flex-1 py-4 px-3 space-y-1'>
                <MobileNavItem to={ROUTES.home} icon={Home}>
                  {t('nav.home', 'Home')}
                </MobileNavItem>
                <MobileNavItem to={ROUTES.pricing} icon={Wallet}>
                  {t('nav.pricing', 'Pricing')}
                </MobileNavItem>

                {!hideAuthButtons && (
                  <>
                    <Separator className='my-3' />
                    <MobileNavItem to={AUTH_ROUTES.signIn} icon={LogIn}>
                      {t('home.cta.signIn', 'Sign in')}
                    </MobileNavItem>
                    <MobileNavItem to={AUTH_ROUTES.signUp} icon={Rocket}>
                      {t('home.cta.getStarted', 'Get Started')}
                    </MobileNavItem>
                  </>
                )}
              </div>

              {/* Theme controls */}
              <div className='border-t py-4 px-4 flex items-center justify-center gap-2'>
                <LanguageSelect compact />
                <PaletteSelect compact />
                <ModeSelect compact />
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}

function MobileNavItem({
  to,
  icon: Icon,
  children
}: {
  to: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )
      }
    >
      <Icon className='h-5 w-5' />
      <span>{children}</span>
    </NavLink>
  )
}
