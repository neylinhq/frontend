import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData, useRevalidator } from 'react-router'

import {
  type PaymentHistory,
  type PaymentMethod,
  subscriptionApi,
  useAddCryptoPaymentMethod,
  useAddPaymentMethod,
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
import { getCookies } from '@/shared/api/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Typography } from '@/shared/components/typography'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookies = getCookies(request)

  try {
    const [paymentMethods, paymentHistoryData] = await Promise.all([
      subscriptionApi.getPaymentMethods({ cookies }),
      subscriptionApi.getPaymentHistory(20, 0, { cookies })
    ])

    return {
      paymentMethods,
      paymentHistory: paymentHistoryData.payments || []
    }
  } catch (error) {
    console.error('Failed to load billing data:', error)
    return {
      paymentMethods: [] as PaymentMethod[],
      paymentHistory: [] as PaymentHistory[]
    }
  }
}

interface LoaderData {
  paymentMethods: PaymentMethod[]
  paymentHistory: PaymentHistory[]
}

const BillingPage = () => {
  const { t } = useTranslation()
  const loaderData = useLoaderData() as LoaderData
  const revalidator = useRevalidator()

  // Mutations only - SSR data is already loaded
  const paymentMethods = loaderData.paymentMethods || []
  const paymentHistory = loaderData.paymentHistory || []

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
            onAddCard={data =>
              addPaymentMethod.mutate(data, {
                onSuccess: () => revalidator.revalidate()
              })
            }
            onAddCrypto={data => {
              addCryptoPaymentMethod.mutate(
                {
                  walletAddress: data.address,
                  network: data.network,
                  currency: 'USDT'
                },
                {
                  onSuccess: () => revalidator.revalidate()
                }
              )
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
                onRemove={id =>
                  removePaymentMethod.mutate(id, {
                    onSuccess: () => revalidator.revalidate()
                  })
                }
                onSetDefault={id =>
                  setDefaultPaymentMethod.mutate(id, {
                    onSuccess: () => revalidator.revalidate()
                  })
                }
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
          removePaymentMethod.mutate(id, {
            onSuccess: () => {
              revalidator.revalidate()
              setDetailsOpen(false)
            }
          })
        }}
        onSetDefault={id => {
          setDefaultPaymentMethod.mutate(id, {
            onSuccess: () => revalidator.revalidate()
          })
        }}
        onUpdate={data => {
          updatePaymentMethod.mutate(data, {
            onSuccess: () => revalidator.revalidate()
          })
        }}
        loading={removePaymentMethod.isPending || setDefaultPaymentMethod.isPending}
        updateLoading={updatePaymentMethod.isPending}
      />
    </div>
  )
}

export default BillingPage
