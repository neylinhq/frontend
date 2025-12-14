import { Check } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import type { PlanDetails } from '@/entities/subscription'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

interface PlanCardProps {
  plan: PlanDetails
  isCurrentPlan: boolean
  onSelect: () => void
  loading?: boolean
  highlighted?: boolean
}

export const PlanCard = memo(
  ({ plan, isCurrentPlan, onSelect, loading, highlighted }: PlanCardProps) => {
    const { t } = useTranslation()

    const formatPrice = (cents: number) => {
      return (cents / 100).toFixed(2)
    }

    return (
      <div
        className={cn(
          'relative h-full p-6 rounded-xl border transition-all duration-200 flex flex-col',
          highlighted
            ? 'border-foreground/20 bg-foreground/[0.02]'
            : 'border-border/50 hover:border-border',
          isCurrentPlan && 'border-foreground/30'
        )}
      >
        {/* Popular badge */}
        {highlighted && !isCurrentPlan && (
          <div className='absolute -top-3 left-6'>
            <span className='text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full bg-foreground text-background'>
              {t('pricing.popular')}
            </span>
          </div>
        )}

        {/* Current badge */}
        {isCurrentPlan && (
          <div className='absolute -top-3 left-6'>
            <span className='text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border'>
              {t('billing.currentPlan')}
            </span>
          </div>
        )}

        {/* Header */}
        <div className={cn('mb-6', (highlighted || isCurrentPlan) && 'mt-2')}>
          <h3 className='text-lg font-medium mb-1'>{plan.name}</h3>
          <p className='text-sm text-muted-foreground'>
            {t(`billing.planDescriptions.${plan.type}`)}
          </p>
        </div>

        {/* Price */}
        <div className='mb-6'>
          <div className='flex items-baseline gap-1'>
            <span className='text-4xl font-semibold tracking-tight'>
              ${formatPrice(plan.price)}
            </span>
            <span className='text-sm text-muted-foreground'>
              /{t(`billing.interval.${plan.interval}`)}
            </span>
          </div>
        </div>

        {/* Features */}
        <ul className='space-y-3 flex-1'>
          {plan.features.map(feature => (
            <li key={feature} className='flex gap-3 items-start text-sm'>
              <Check className='h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5' />
              <span className='text-muted-foreground'>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || loading}
          className='w-full mt-6'
          variant={highlighted && !isCurrentPlan ? 'default' : 'outline'}
          size='sm'
        >
          {isCurrentPlan ? t('billing.currentPlanButton') : t('billing.selectPlan')}
        </Button>
      </div>
    )
  }
)

PlanCard.displayName = 'PlanCard'
