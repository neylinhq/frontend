import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ModeSelect } from '@/features/theme/mode-select'
import { PaletteSelect } from '@/features/theme/palette-select'
import { DOCS_ROUTES, ROUTES } from '@/shared/config'
import { Button } from '@/shared/components/button'
import { DocsSearchTrigger } from '@/shared/components/docs-search'
import { LanguageSelect } from '@/shared/components/language-switcher'
import { Logo } from '@/shared/components/logo'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/sheet'

interface DocsHeaderProps {
  mobileNav?: React.ReactNode
}

export const DocsHeader = ({ mobileNav }: DocsHeaderProps) => {
  const { t } = useTranslation()
  return (
    <header className='h-14 flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
      <div
        className='mx-auto px-4 md:px-6 h-full flex items-center gap-4'
        style={{ maxWidth: '1400px' }}
      >
        {/* Mobile menu */}
        {mobileNav && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>{t('docs.toggleMenu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-[300px] p-0 flex flex-col h-full'>
              <div className='py-4 px-6 border-b flex-shrink-0'>
                <Logo size='sm' />
              </div>
              <div className='overflow-y-auto flex-1 py-6 px-4'>{mobileNav}</div>
            </SheetContent>
          </Sheet>
        )}

        {/* Logo + Docs badge */}
        <Link to={ROUTES.home} className='flex items-center gap-2'>
          <Logo size='lg' href={false} />
        </Link>
        <span className='text-muted-foreground text-lg font-light'>/</span>
        <Link
          to={DOCS_ROUTES.ui}
          className='text-sm font-medium hover:text-foreground transition-colors'
        >
          {t('docs.title')}
        </Link>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Search */}
        <DocsSearchTrigger className='hidden md:inline-flex' />

        {/* Theme controls */}
        <nav className='flex items-center gap-1'>
          <PaletteSelect compact />
          <ModeSelect compact />
          <LanguageSelect compact />
        </nav>
      </div>
    </header>
  )
}
