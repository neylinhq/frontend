import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { motion } from 'framer-motion'

import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { usePlans } from '@/entities/subscription'
import { PlanCard } from '@/features/billing'
import { LanguageSwitcher } from '@/features/language-switcher'
import { APP_NAME } from '@/shared/config/app'
import { Logo } from '@/shared/ui/logo'

export function PricingPage() {
  const { t } = useTranslation()
  const { data: plans, isLoading } = usePlans()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-screen-xl mx-auto flex h-14 items-center justify-between px-6">
          <Logo size="lg" />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="flex-1 px-6 py-20">
        <div className="max-w-screen-xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              {t('pricing.title')}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('pricing.subtitle')}
            </p>
          </motion.div>

          {/* Plans */}
          {isLoading ? (
            <div className="text-center py-20">
              <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch">
              {plans?.map((plan, index) => (
                <motion.div
                  key={plan.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full"
                >
                  <PlanCard
                    plan={plan}
                    isCurrentPlan={false}
                    highlighted={plan.type === 'pro'}
                    onSelect={() => {
                      window.location.href = '/auth/sign-up'
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-sm text-muted-foreground">
              {t('pricing.questions')}{' '}
              <a href="mailto:support@arbor.com" className="text-foreground hover:underline">
                {t('pricing.contactUs')}
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {APP_NAME.charAt(0).toUpperCase() + APP_NAME.slice(1)}</span>
          <div className="flex gap-6">
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">
              {t('legal.terms.title')}
            </Link>
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">
              {t('legal.privacy.title')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
