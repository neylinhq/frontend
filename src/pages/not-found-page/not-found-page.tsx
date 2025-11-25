import { Home, LayoutDashboard, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Logo size="xl" />

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-[200px] font-bold text-muted-foreground/10 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{t('notFound.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance">
              {t('notFound.description')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                {t('notFound.backToHome')}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/dashboard/overview">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('notFound.goToDashboard')}
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="pt-8 border-t">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/legal/terms" className="text-primary hover:underline">
                {t('legal.terms.title')}
              </Link>
              <Link to="/legal/privacy" className="text-primary hover:underline">
                {t('legal.privacy.title')}
              </Link>
              <Link to="/legal/cookies" className="text-primary hover:underline">
                {t('legal.cookies.title')}
              </Link>
              <Link to="/legal/license" className="text-primary hover:underline">
                {t('legal.license.title')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
