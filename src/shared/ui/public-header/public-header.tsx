import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ColorThemeSelect } from '@/app/theme/components/color-theme-select'
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
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <Logo size="lg" />

        <nav className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            {t('home.nav.pricing', 'Pricing')}
          </Link>
          <LanguageSelect compact />
          <ModeSelect />
          <ColorThemeSelect compact />
          {!hideAuthButtons && (
            <>
              <div className="h-4 w-px bg-border mx-1" />
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth/sign-in">{t('home.cta.signIn', 'Sign in')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth/sign-up">{t('home.cta.getStarted', 'Get Started')}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
