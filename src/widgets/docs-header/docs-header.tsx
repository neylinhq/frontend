import { Menu01Icon } from '@untitledui/icons-react/outline'
import { Link } from 'react-router'
import { ModeSelect } from '@/features/theme/mode-select'
import { PaletteSelect } from '@/features/theme/palette-select'
import { AuthNav } from '@/widgets/auth-nav'
import { Button } from '@/shared/components/button'
import { DocsSearchTrigger } from '@/shared/components/docs-search'
import { LanguageSelect } from '@/shared/components/language-switcher'
import { Logo } from '@/shared/components/logo'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/sheet'
import { DOCS_ROUTES, ROUTES } from '@/shared/config'

interface DocsHeaderProps {
  mobileNav?: React.ReactNode
}

export const DocsHeader = ({ mobileNav }: DocsHeaderProps) => {
  return (
    <header className='h-14 flex-shrink-0 border-b bg-background sticky top-0 z-50'>
      <div className='px-4 md:px-6 h-full flex items-center gap-4'>
        {/* Mobile menu */}
        {mobileNav && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu01Icon className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-[300px] p-0 flex flex-col h-full'>
              <SheetTitle className='sr-only'>Navigation menu</SheetTitle>
              <div className='py-4 px-6 border-b flex-shrink-0'>
                <Logo size='md' />
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
          Docs
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
          <AuthNav compact showSeparator />
        </nav>
      </div>
    </header>
  )
}
