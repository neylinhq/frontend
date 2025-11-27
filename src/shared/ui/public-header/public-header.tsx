import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ModeSelect } from '@/app/theme/components/mode-select'
import { LanguageSelect } from '@/features/language-switcher'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

interface PublicHeaderProps {
  hideAuthButtons?: boolean
}

export function PublicHeader({ hideAuthButtons }: PublicHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="h-14 flex-shrink-0 border-b bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <Logo size="lg" />

        <nav className="flex items-center gap-2">
          <LanguageSelect compact />
          <ModeSelect compact />
          {!hideAuthButtons && (
            <>
              <div className="hidden md:block h-4 w-px bg-border mx-1" />
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/auth/sign-in">{t('home.cta.signIn', 'Sign in')}</Link>
              </Button>
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link to="/auth/sign-up">{t('home.cta.getStarted', 'Get Started')}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
