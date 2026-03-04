import {
  Home01Icon,
  LogIn01Icon,
  Menu01Icon,
  Rocket01Icon,
  Wallet01Icon
} from '@untitledui/icons-react/outline'
import type { ComponentType, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'

import { AuthNav } from '@/widgets/auth-nav'
import { ModeSelect } from '@/features/theme/mode-select'
import { PaletteSelect } from '@/features/theme/palette-select'
import { Button } from '@/shared/components/button'
import { LanguageSelect } from '@/shared/components/language-switcher'
import { Logo } from '@/shared/components/logo'
import { Separator } from '@/shared/components/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/sheet'
import { AUTH_ROUTES, ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

export const PublicHeader = () => {
  const { t } = useTranslation()

  return (
    <header className='h-14 flex-shrink-0 border-b bg-background'>
      <div className='max-w-5xl mx-auto px-4 md:px-6 h-full flex items-center justify-between'>
        <Logo size='xl' />

        <nav className='flex items-center gap-2'>
          {/* Desktop theme controls */}
          <div className='hidden md:flex items-center gap-0.5'>
            <LanguageSelect compact />
            <PaletteSelect compact />
            <ModeSelect compact />
          </div>

          {/* Desktop auth */}
          <AuthNav compact />

          {/* Mobile menu - always visible */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden'>
                <Menu01Icon className='h-5 w-5' />
                <span className='sr-only'>{t('common.menu', 'Menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-72 p-0 flex flex-col'>
              <SheetTitle className='sr-only'>{t('common.menu', 'Menu')}</SheetTitle>
              <div className='py-4 px-6 border-b'>
                <Logo size='lg' />
              </div>

              {/* Navigation */}
              <div className='flex-1 py-4 px-3 space-y-1'>
                <MobileNavItem to={ROUTES.home} icon={Home01Icon}>
                  {t('home.nav.home')}
                </MobileNavItem>
                <MobileNavItem to={ROUTES.pricing} icon={Wallet01Icon}>
                  {t('home.nav.pricing')}
                </MobileNavItem>

                <Separator className='my-3' />
                <MobileNavItem to={AUTH_ROUTES.signIn} icon={LogIn01Icon}>
                  {t('home.cta.signIn', 'Sign in')}
                </MobileNavItem>
                <MobileNavItem to={AUTH_ROUTES.signUp} icon={Rocket01Icon}>
                  {t('home.cta.getStarted', 'Get Started')}
                </MobileNavItem>
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

const MobileNavItem = ({
  to,
  icon: Icon,
  children
}: {
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  children: React.ReactNode
}) => {
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
