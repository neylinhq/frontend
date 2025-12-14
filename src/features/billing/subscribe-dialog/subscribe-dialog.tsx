import { CreditCard, Loader2, Wallet } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork, PaymentMethod, PlanDetails } from '@/entities/subscription'
import { shortenWalletAddress, getNetworkDisplayName } from '@/entities/subscription/lib/crypto-utils'
import { Button } from '@/shared/components/button'
import { CardBrandIcon } from '@/shared/components/card-brand-icon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'
import { cn } from '@/shared/lib/cn'
import { AddPaymentMethodContent } from './components/add-payment-method-content'

type Step = 'add-method' | 'confirm'

interface SubscribeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanDetails
  paymentMethods: PaymentMethod[]
  onSubscribe: (paymentMethodId: string) => Promise<void>
  onAddCard: (data: { cardholderName: string; cardNumber: string; brand: string; expiryMonth: number; expiryYear: number }) => Promise<PaymentMethod>
  onAddCrypto: (data: { network: CryptoNetwork; address: string }) => Promise<PaymentMethod>
}

export const SubscribeDialog = ({
  open,
  onOpenChange,
  plan,
  paymentMethods,
  onSubscribe,
  onAddCard,
  onAddCrypto
}: SubscribeDialogProps) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>(() =>
    paymentMethods.length > 0 ? 'confirm' : 'add-method'
  )
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(() =>
    paymentMethods.find(m => m.isDefault)?.id ?? paymentMethods[0]?.id ?? null
  )
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isAddingMethod, setIsAddingMethod] = useState(false)

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  const handleAddCard = useCallback(async (data: { cardholderName: string; cardNumber: string; brand: string; expiryMonth: number; expiryYear: number }) => {
    setIsAddingMethod(true)
    try {
      const newMethod = await onAddCard(data)
      setSelectedMethodId(newMethod.id)
      setStep('confirm')
    } finally {
      setIsAddingMethod(false)
    }
  }, [onAddCard])

  const handleAddCrypto = useCallback(async (data: { network: CryptoNetwork; address: string }) => {
    setIsAddingMethod(true)
    try {
      const newMethod = await onAddCrypto(data)
      setSelectedMethodId(newMethod.id)
      setStep('confirm')
    } finally {
      setIsAddingMethod(false)
    }
  }, [onAddCrypto])

  const handleSubscribe = async () => {
    if (!selectedMethodId) return

    setIsSubscribing(true)
    try {
      await onSubscribe(selectedMethodId)
      onOpenChange(false)
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset step on close if we have payment methods
    if (paymentMethods.length > 0) {
      setStep('confirm')
    }
  }

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>
            {step === 'add-method'
              ? t('billing.subscribe.addMethodTitle')
              : t('billing.subscribe.confirmTitle')}
          </DialogTitle>
          <DialogDescription>
            {step === 'add-method'
              ? t('billing.subscribe.addMethodDescription')
              : t('billing.subscribe.confirmDescription', { planName: plan.name })}
          </DialogDescription>
        </DialogHeader>

        {/* Add Payment Method Step */}
        {step === 'add-method' && (
          <AddPaymentMethodContent
            onAddCard={handleAddCard}
            onAddCrypto={handleAddCrypto}
            loading={isAddingMethod}
          />
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className='py-4 space-y-6'>
            {/* Plan Summary */}
            <div className='p-4 rounded-lg border border-border bg-muted/30'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='font-medium'>{plan.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {t(`billing.planDescriptions.${plan.type}`)}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-semibold'>${formatPrice(plan.price)}</div>
                  <div className='text-sm text-muted-foreground'>
                    /{t(`billing.interval.${plan.interval}`)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <div className='text-sm font-medium mb-3'>{t('billing.subscribe.paymentMethod')}</div>
              <div className='space-y-2'>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type='button'
                    onClick={() => setSelectedMethodId(method.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      selectedMethodId === method.id
                        ? 'bg-muted/50'
                        : 'hover:bg-muted/30'
                    )}
                  >
                    {method.type === 'card' ? (
                      <>
                        <CardBrandIcon brand={method.brand} size='sm' />
                        <div className='flex-1'>
                          <div className='font-medium'>•••• {method.last4}</div>
                          <div className='text-xs text-muted-foreground'>
                            {t('billing.expiresAt', { month: method.expiryMonth, year: method.expiryYear })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='flex-1'>
                          <div className='font-medium font-mono'>
                            {shortenWalletAddress(method.walletAddress)}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {getNetworkDisplayName(method.network)} • {method.currency}
                          </div>
                        </div>
                      </>
                    )}
                    {method.isDefault && (
                      <span className='text-xs text-muted-foreground'>
                        {t('billing.default')}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Add new method button */}
              <Button
                variant='ghost'
                size='sm'
                className='mt-3 w-full'
                onClick={() => setStep('add-method')}
              >
                <CreditCard className='h-4 w-4 mr-2' />
                {t('billing.subscribe.addNewMethod')}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        {step === 'confirm' && (
          <DialogFooter>
            <Button variant='outline' onClick={handleClose} disabled={isSubscribing}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={!selectedMethodId || isSubscribing}
            >
              {isSubscribing ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {t('common.loading')}
                </>
              ) : (
                t('billing.subscribe.confirm', { price: `$${formatPrice(plan.price)}` })
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
