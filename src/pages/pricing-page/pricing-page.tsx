import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'
import { Logo } from '@/shared/ui/logo'
import { usePlans } from '@/entities/subscription'
import { PlanCard } from '@/features/billing'

export function PricingPage() {
  const { t } = useTranslation()
  const { data: plans, isLoading } = usePlans()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - same as home page */}
      <header className="w-full border-b bg-background sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Logo size="xl" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="flex-1 px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t('pricing.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Plans Grid */}
          {isLoading ? (
            <div className="text-center">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {plans?.map(plan => (
                <PlanCard
                  key={plan.type}
                  plan={plan}
                  isCurrentPlan={false}
                  highlighted={plan.type === 'pro'}
                  onSelect={() => {
                    // Navigate to sign up
                    window.location.href = '/auth/sign-up'
                  }}
                />
              ))}
            </div>
          )}

          {/* FAQ or Additional Info */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('pricing.questions')}{' '}
              <a href="mailto:support@arbor.com" className="text-primary hover:underline">
                {t('pricing.contactUs')}
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer - same as home page */}
      <footer className="border-t py-8 md:py-10 bg-muted/20">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
            <div className="font-medium">
              © {new Date().getFullYear()} Arbor. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/legal/terms"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.terms.title')}
              </Link>
              <Link
                to="/legal/privacy"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.privacy.title')}
              </Link>
              <Link
                to="/legal/cookies"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.cookies.title')}
              </Link>
              <Link
                to="/legal/license"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.license.title')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
