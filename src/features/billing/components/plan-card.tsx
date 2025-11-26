import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import type { PlanDetails } from '@/entities/subscription'
import { cn } from '@/shared/lib/cn'

interface PlanCardProps {
  plan: PlanDetails
  isCurrentPlan: boolean
  onSelect: () => void
  loading?: boolean
  highlighted?: boolean
}

export function PlanCard({ plan, isCurrentPlan, onSelect, loading, highlighted }: PlanCardProps) {
  const { t } = useTranslation()

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  return (
    <Card
      className={cn(
        'relative flex flex-col h-full',
        isCurrentPlan && 'border-primary border-2',
        highlighted && 'border-primary border-2 shadow-xl scale-[1.02]',
        'transition-all duration-300 hover:shadow-lg'
      )}
    >
      {isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-md">
          {t('billing.currentPlan')}
        </Badge>
      )}
      {highlighted && !isCurrentPlan && (
        <div className="bg-primary text-primary-foreground text-center py-2.5 text-sm font-semibold rounded-t-lg">
          {t('pricing.popular')}
        </div>
      )}
      <CardHeader className="pb-8">
        <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
        <div className="pt-6 border-t mt-6">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight">${formatPrice(plan.price)}</span>
            <span className="text-muted-foreground text-lg">
              /{t(`billing.interval.${plan.interval}`)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 pt-0">
        <ul className="space-y-3 flex-1 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex gap-3 items-start">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || loading}
          className="w-full mt-auto"
          size="lg"
          variant={highlighted && !isCurrentPlan ? 'default' : isCurrentPlan ? 'secondary' : 'outline'}
        >
          {isCurrentPlan ? t('billing.currentPlanButton') : t('billing.selectPlan')}
        </Button>
      </CardContent>
    </Card>
  )
}
