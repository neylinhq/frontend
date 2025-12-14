import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'

import {
  type PaymentHistory,
  type PaymentMethod,
  useAddCryptoPaymentMethod,
  useAddPaymentMethod,
  usePaymentMethods,
  useRemovePaymentMethod,
  useSetDefaultPaymentMethod,
  useUpdatePaymentMethod
} from '@/entities/subscription'
import { AddPaymentMethodDialog } from '@/features/billing/add-payment-method'
import { PaymentHistoryTable } from '@/features/billing/payment-history'
import {
  PaymentMethodCard,
  PaymentMethodDetailsDialog
} from '@/features/billing/payment-method-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Typography } from '@/shared/components/typography'

// TODO: Implement payment methods API endpoints
export const loader = async () => {
  // Return empty data until payment endpoints are implemented
  return {
    paymentMethods: [] as PaymentMethod[],
    paymentHistory: [] as PaymentHistory[]
  }
}

interface LoaderData {
  paymentMethods: PaymentMethod[]
  paymentHistory: PaymentHistory[]
}

const BillingPage = () => {
  const { t } = useTranslation()
  const { paymentHistory } = useLoaderData() as LoaderData

  // Use React Query to fetch payment methods
  const { data: paymentMethods = [] } = usePaymentMethods()

  const addPaymentMethod = useAddPaymentMethod()
  const addCryptoPaymentMethod = useAddCryptoPaymentMethod()
  const removePaymentMethod = useRemovePaymentMethod()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()
  const updatePaymentMethod = useUpdatePaymentMethod()

  // State for details dialog
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setDetailsOpen(true)
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h2'>{t('settings.billing.title')}</Typography>
        <p className='text-sm text-muted-foreground mt-1'>{t('settings.billing.description')}</p>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader className='flex flex-row items-start justify-between space-y-0'>
          <div className='space-y-1'>
            <CardTitle>{t('settings.billing.paymentMethods.title')}</CardTitle>
            <CardDescription className='text-balance'>
              {t('settings.billing.paymentMethods.description')}
            </CardDescription>
          </div>
          <AddPaymentMethodDialog
            onAddCard={data => addPaymentMethod.mutate(data)}
            onAddCrypto={data => {
              console.log('[BillingPage] onAddCrypto called with:', data)
              addCryptoPaymentMethod.mutate({
                walletAddress: data.address,
                network: data.network,
                currency: 'USDT'
              })
              console.log('[BillingPage] mutation triggered, isPending:', addCryptoPaymentMethod.isPending)
            }}
            loadingCard={addPaymentMethod.isPending}
            loadingCrypto={addCryptoPaymentMethod.isPending}
          />
        </CardHeader>
        <CardContent className='space-y-4'>
          {paymentMethods.length > 0 ? (
            paymentMethods.map(method => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onRemove={id => removePaymentMethod.mutate(id)}
                onSetDefault={id => setDefaultPaymentMethod.mutate(id)}
                onEdit={handleEdit}
                loading={
                  (removePaymentMethod.isPending && removePaymentMethod.variables === method.id) ||
                  (setDefaultPaymentMethod.isPending &&
                    setDefaultPaymentMethod.variables === method.id)
                }
              />
            ))
          ) : (
            <p className='text-sm text-muted-foreground text-center py-8'>
              {t('settings.billing.paymentMethods.empty')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <PaymentHistoryTable payments={paymentHistory} />

      {/* Details Dialog */}
      <PaymentMethodDetailsDialog
        method={selectedMethod}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onRemove={id => {
          removePaymentMethod.mutate(id)
          setDetailsOpen(false)
        }}
        onSetDefault={id => {
          setDefaultPaymentMethod.mutate(id)
        }}
        onUpdate={data => {
          updatePaymentMethod.mutate(data)
        }}
        loading={removePaymentMethod.isPending || setDefaultPaymentMethod.isPending}
        updateLoading={updatePaymentMethod.isPending}
      />
    </div>
  )
}

export default BillingPage
