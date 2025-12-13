import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CryptoNetwork, PaymentMethod, PlanDetails } from '@/entities/subscription'
import { usePaymentMethods, useCreateCheckoutSession, useAddPaymentMethod } from '@/entities/subscription'
import { useCurrentUser } from '@/entities/user'
import { PlanCard } from '@/features/billing/plan-card'
import { SubscribeDialog } from '@/features/billing/subscribe-dialog'
import { Typography } from '@/shared/components/typography'

interface PricingPageProps {
  plans: PlanDetails[]
}

export const PricingPage = ({ plans }: PricingPageProps) => {
  const { t } = useTranslation()
  const { data: user } = useCurrentUser()
  const { data: paymentMethods = [] } = usePaymentMethods()
  const createCheckoutSession = useCreateCheckoutSession()
  const addPaymentMethod = useAddPaymentMethod()

  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSelectPlan = (plan: PlanDetails) => {
    if (!user) {
      // Not logged in - redirect to sign up
      window.location.href = '/auth/sign-up'
      return
    }

    // Logged in - open subscribe dialog
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  const handleSubscribe = async (paymentMethodId: string) => {
    if (!selectedPlan) return

    // Create checkout session and redirect
    const session = await createCheckoutSession.mutateAsync({
      planType: selectedPlan.type,
      paymentMethodId
    })

    if (session.url) {
      window.location.href = session.url
    }
  }

  const handleAddCard = async (data: { cardholderName: string; cardNumber: string; brand: string; expiryMonth: number; expiryYear: number }): Promise<PaymentMethod> => {
    const result = await addPaymentMethod.mutateAsync({
      type: 'card',
      cardholderName: data.cardholderName,
      last4: data.cardNumber,
      brand: data.brand as PaymentMethod['type'] extends 'card' ? PaymentMethod['brand'] : never,
      expiryMonth: data.expiryMonth,
      expiryYear: data.expiryYear
    })
    return result
  }

  const handleAddCrypto = async (data: { network: CryptoNetwork; address: string }): Promise<PaymentMethod> => {
    const result = await addPaymentMethod.mutateAsync({
      type: 'crypto',
      walletAddress: data.address,
      network: data.network,
      currency: 'USDT'
    })
    return result
  }

  return (
    <div className='pt-14 pb-20 px-6'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-16'>
          <Typography variant='h1' className='mb-3'>
            {t('pricing.title', 'Simple pricing')}
          </Typography>
          <p className='text-muted-foreground max-w-lg mx-auto'>
            {t('pricing.subtitle', 'Choose the plan that works for you')}
          </p>
        </div>

        {/* Plans */}
        <div className='grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch'>
          {plans.map(plan => (
            <div key={plan.type} className='h-full'>
              <PlanCard
                plan={plan}
                isCurrentPlan={false}
                highlighted={plan.type === 'pro'}
                onSelect={() => handleSelectPlan(plan)}
              />
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className='text-center mt-16'>
          <p className='text-sm text-muted-foreground'>
            {t('pricing.questions', 'Questions?')}{' '}
            <a href='mailto:support@neylin.com' className='text-foreground hover:underline'>
              {t('pricing.contactUs', 'Contact us')}
            </a>
          </p>
        </div>
      </div>

      {/* Subscribe Dialog */}
      {selectedPlan && (
        <SubscribeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          plan={selectedPlan}
          paymentMethods={paymentMethods}
          onSubscribe={handleSubscribe}
          onAddCard={handleAddCard}
          onAddCrypto={handleAddCrypto}
        />
      )}
    </div>
  )
}
