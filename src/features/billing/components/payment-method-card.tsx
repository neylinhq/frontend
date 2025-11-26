import { CreditCard, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import type { PaymentMethod } from '@/entities/subscription'
import { cn } from '@/shared/lib/cn'

interface PaymentMethodCardProps {
  method: PaymentMethod
  onRemove: (id: string) => void
  onSetDefault: (id: string) => void
  loading?: boolean
}

export function PaymentMethodCard({
  method,
  onRemove,
  onSetDefault,
  loading
}: PaymentMethodCardProps) {
  const { t } = useTranslation()

  const getBrandIcon = () => {
    // In real implementation, use proper card brand icons
    return <CreditCard className="h-8 w-8" />
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border bg-card transition-colors',
        method.isDefault ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-accent/50'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-md bg-muted">
          {getBrandIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">
              {method.brand} •••• {method.last4}
            </span>
            {method.isDefault && (
              <Badge variant="secondary">{t('billing.defaultPaymentMethod')}</Badge>
            )}
          </div>
          {method.expiryMonth && method.expiryYear && (
            <p className="text-sm text-muted-foreground">
              {t('billing.expires')}: {method.expiryMonth.toString().padStart(2, '0')}/
              {method.expiryYear}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {!method.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(method.id)}
            disabled={loading}
          >
            {t('billing.setAsDefault')}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(method.id)}
          disabled={loading || method.isDefault}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
