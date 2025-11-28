import { useTranslation } from 'react-i18next'

import type { PlanDetails } from '@/entities/subscription/subscription.schema'
import { PlanCard } from '@/features/billing'
import { Typography } from '@/shared/ui/typography'

interface PricingPageProps {
  plans: PlanDetails[]
}

export function PricingPage({ plans }: PricingPageProps) {
  const { t } = useTranslation()

  return (
    <div className="pt-14 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="mb-3">
            {t('pricing.title', 'Simple pricing')}
          </Typography>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('pricing.subtitle', 'Choose the plan that works for you')}
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch">
          {plans.map(plan => (
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
    </div>
  )
}
