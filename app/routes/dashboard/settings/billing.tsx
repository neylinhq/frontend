import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'

import {
  type PaymentHistory,
  type PaymentMethod,
  useAddPaymentMethod,
  useRemovePaymentMethod,
  useSetDefaultPaymentMethod,
  useUpdatePaymentMethod
} from '@/entities/subscription'
import { AddPaymentMethodDialog } from '@/features/billing/add-payment-method'
import { CryptoSubscriptionDialog } from '@/features/billing/crypto-subscription-dialog'
import { PaymentHistoryTable } from '@/features/billing/payment-history'
import {
  PaymentMethodCard,
  PaymentMethodDetailsDialog
} from '@/features/billing/payment-method-card'
import { Button } from '@/shared/components/button'
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
  const { paymentMethods, paymentHistory } = useLoaderData() as LoaderData

  const addPaymentMethod = useAddPaymentMethod()
  const removePaymentMethod = useRemovePaymentMethod()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()
  const updatePaymentMethod = useUpdatePaymentMethod()

  // State for details dialog
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Crypto subscription dialog state
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false)

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
                // TODO: implement addCryptoWallet mutation
                console.log('Add crypto wallet:', data)
              }}
              loadingCard={addPaymentMethod.isPending}
              loadingCrypto={false}
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

      {/* Crypto Subscription Test */}
      <Card>
        <CardHeader>
          <CardTitle>Crypto Subscription (Test)</CardTitle>
          <CardDescription>Test crypto payment dialog</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setCryptoDialogOpen(true)}>
            Pay with Crypto
          </Button>
        </CardContent>
      </Card>

      {/* Crypto Subscription Dialog */}
      <CryptoSubscriptionDialog
        open={cryptoDialogOpen}
        onOpenChange={setCryptoDialogOpen}
        planType='pro'
        amount={9.99}
        onSuccess={() => {
          console.log('Subscription successful!')
          setCryptoDialogOpen(false)
        }}
      />

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
