import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import {
  subscriptionApi,
  useRemovePaymentMethod,
  useSetDefaultPaymentMethod,
  useAddPaymentMethod,
  type PaymentMethod,
  type PaymentHistory
} from '@/entities/subscription'
import {
  PaymentHistoryTable,
  PaymentMethodCard,
  AddPaymentMethodDialog
} from '@/features/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Typography } from '@/shared/ui/typography'

export async function loader() {
  const [paymentMethods, paymentHistory] = await Promise.all([
    subscriptionApi.getPaymentMethods(),
    subscriptionApi.getPaymentHistory()
  ])
  return { paymentMethods, paymentHistory }
}

interface LoaderData {
  paymentMethods: PaymentMethod[]
  paymentHistory: PaymentHistory[]
}

export default function BillingPage() {
  const { t } = useTranslation()
  const { paymentMethods, paymentHistory } = useLoaderData() as LoaderData

  const addPaymentMethod = useAddPaymentMethod()
  const removePaymentMethod = useRemovePaymentMethod()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2">{t('settings.billing.title')}</Typography>
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
          {paymentMethods.length > 0 ? (
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
      <PaymentHistoryTable payments={paymentHistory} />
    </div>
  )
}
