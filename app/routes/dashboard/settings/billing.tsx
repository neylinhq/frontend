import { useTranslation } from 'react-i18next'
import {
  usePaymentHistory,
  usePaymentMethods,
  useRemovePaymentMethod,
  useSetDefaultPaymentMethod,
  useAddPaymentMethod
} from '@/entities/subscription'
import {
  PaymentHistoryTable,
  PaymentMethodCard,
  AddPaymentMethodDialog
} from '@/features/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function BillingPage() {
  const { t } = useTranslation()

  const { data: paymentHistory, isLoading: historyLoading } = usePaymentHistory()
  const { data: paymentMethods, isLoading: methodsLoading } = usePaymentMethods()

  const addPaymentMethod = useAddPaymentMethod()
  const removePaymentMethod = useRemovePaymentMethod()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()

  if (historyLoading || methodsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('settings.billing.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.billing.description')}</p>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('settings.billing.paymentMethods.title')}</CardTitle>
              <CardDescription>{t('settings.billing.paymentMethods.description')}</CardDescription>
            </div>
            <AddPaymentMethodDialog
              onAdd={data => addPaymentMethod.mutate(data)}
              loading={addPaymentMethod.isPending}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map(method => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onRemove={id => removePaymentMethod.mutate(id)}
                onSetDefault={id => setDefaultPaymentMethod.mutate(id)}
                loading={removePaymentMethod.isPending || setDefaultPaymentMethod.isPending}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('settings.billing.paymentMethods.empty')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {paymentHistory && <PaymentHistoryTable payments={paymentHistory} />}
    </div>
  )
}
