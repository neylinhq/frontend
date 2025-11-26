import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { usePlans } from '@/entities/subscription'
import { PlanCard } from '@/features/billing'
import { LanguageSwitcher } from '@/features/language-switcher'
import { APP_NAME, CURRENT_YEAR } from '@/shared/config/app'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

export function PricingPage() {
  const { t } = useTranslation()
  const { data: plans, isLoading } = usePlans()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full h-14 border-b bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/">
            <Logo size="lg" />
          </Link>

          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth/sign-in">{t('home.cta.signIn', 'Sign in')}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth/sign-up">{t('home.cta.getStarted', 'Get Started')}</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {t('pricing.title', 'Simple pricing')}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('pricing.subtitle', 'Choose the plan that works for you')}
            </p>
          </div>

          {/* Plans */}
          {isLoading ? (
            <div className="text-center py-20">
              <span className="text-sm text-muted-foreground">{t('common.loading', 'Loading...')}</span>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch">
              {plans?.map((plan) => (
                <div key={plan.type} className="h-full">
                  <PlanCard
                    plan={plan}
                    isCurrentPlan={false}
                    highlighted={plan.type === 'pro'}
                    onSelect={() => {
                      window.location.href = '/auth/sign-up'
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Contact */}
          <div className="text-center mt-16">
            <p className="text-sm text-muted-foreground">
              {t('pricing.questions', 'Questions?')}{' '}
              <a href="mailto:support@arbor.com" className="text-foreground hover:underline">
                {t('pricing.contactUs', 'Contact us')}
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span>© {CURRENT_YEAR} {APP_NAME}</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              {t('home.nav.home', 'Home')}
            </Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">
              {t('legal.terms.title', 'Terms')}
            </Link>
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">
              {t('legal.privacy.title', 'Privacy')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
