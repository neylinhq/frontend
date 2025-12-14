import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight, CreditCard, Eye, EyeOff, Lock, Wallet } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { CryptoNetwork } from '@/entities/subscription'
import { CryptoWalletConnectContent } from '@/features/billing/crypto-wallet-connect'
import { Button } from '@/shared/components/button'
import { CardBrandIcon } from '@/shared/components/card-brand-icon'
import { DialogFooter } from '@/shared/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/form'
import { Input } from '@/shared/components/input'
import {
  type CardBrand,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  parseExpiry
} from '@/shared/lib/card-utils'
import { cn } from '@/shared/lib/cn'

type Step = 'select' | 'card' | 'crypto'

interface AddPaymentMethodContentProps {
  onAddCard: (data: { cardholderName: string; cardNumber: string; brand: string; expiryMonth: number; expiryYear: number }) => void
  onAddCrypto: (data: { network: CryptoNetwork; address: string }) => void
  loading?: boolean
}

// Validation schema
const cardSchema = z.object({
  cardholderName: z.string().min(2),
  cardNumber: z.string().min(13).max(23),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvc: z.string().min(3).max(4)
})

type CardFormValues = z.infer<typeof cardSchema>

const CARD_NUMBER_MAX_LENGTH = 23
const EXPIRY_MAX_LENGTH = 5

const SelectionCard = ({
  icon,
  title,
  description,
  onClick
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-border',
        'hover:border-brand hover:bg-accent/50 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer'
      )}
    >
      <div className='text-muted-foreground'>{icon}</div>
      <div className='text-center'>
        <div className='font-medium text-foreground'>{title}</div>
        <div className='text-sm text-muted-foreground mt-1 text-balance'>{description}</div>
      </div>
    </button>
  )
}

const Breadcrumb = ({
  parentLabel,
  currentLabel,
  onBack,
  disabled
}: {
  parentLabel: string
  currentLabel: string
  onBack: () => void
  disabled?: boolean
}) => {
  return (
    <div className='flex items-center gap-1.5 text-sm mb-4'>
      <button
        type='button'
        onClick={onBack}
        disabled={disabled}
        className='text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50'
      >
        {parentLabel}
      </button>
      <ChevronRight className='h-3.5 w-3.5 text-muted-foreground' />
      <span className='text-foreground'>{currentLabel}</span>
    </div>
  )
}

export const AddPaymentMethodContent = ({
  onAddCard,
  onAddCrypto,
  loading
}: AddPaymentMethodContentProps) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('select')
  const [showCvc, setShowCvc] = useState(false)
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown')

  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvc: ''
    }
  })

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const formatted = formatCardNumber(e.target.value)
      const brand = detectCardBrand(formatted)
      setCardBrand(brand)
      onChange(formatted)
    },
    []
  )

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const formatted = formatExpiry(e.target.value)
      onChange(formatted)
    },
    []
  )

  const handleCardSubmit = (values: CardFormValues) => {
    const parsedExpiry = parseExpiry(values.expiry)
    if (!parsedExpiry || cardBrand === 'unknown') return

    const cardDigits = values.cardNumber.replace(/\D/g, '')

    onAddCard({
      cardholderName: values.cardholderName,
      cardNumber: cardDigits.slice(-4),
      brand: cardBrand,
      expiryMonth: parseInt(parsedExpiry.month, 10),
      expiryYear: parseInt(parsedExpiry.year, 10)
    })
  }

  const handleCryptoSuccess = (network: CryptoNetwork, address: string) => {
    onAddCrypto({ network, address })
  }

  const handleBack = () => {
    setStep('select')
    cardForm.reset()
    setCardBrand('unknown')
  }

  // Selection step
  if (step === 'select') {
    return (
      <div className='grid grid-cols-2 gap-4 py-4'>
        <SelectionCard
          icon={<CreditCard className='h-12 w-12' />}
          title={t('billing.addPaymentMethod.cardOption.title')}
          description={t('billing.addPaymentMethod.cardOption.description')}
          onClick={() => setStep('card')}
        />
        <SelectionCard
          icon={<Wallet className='h-12 w-12' />}
          title={t('billing.addPaymentMethod.cryptoOption.title')}
          description={t('billing.addPaymentMethod.cryptoOption.description')}
          onClick={() => setStep('crypto')}
        />
      </div>
    )
  }

  // Card step
  if (step === 'card') {
    return (
      <>
        <Breadcrumb
          parentLabel={t('billing.addPaymentMethod.selectTitle')}
          currentLabel={t('billing.addPaymentMethod.cardTitle')}
          onBack={handleBack}
          disabled={loading}
        />

        <Form {...cardForm}>
          <form onSubmit={cardForm.handleSubmit(handleCardSubmit)} className='space-y-4'>
            <FormField
              control={cardForm.control}
              name='cardholderName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.addPaymentMethod.cardholderName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholders.name')} autoComplete='cc-name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={cardForm.control}
              name='cardNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.addPaymentMethod.cardNumber')}</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='1234 5678 9012 3456'
                        autoComplete='cc-number'
                        inputMode='numeric'
                        maxLength={CARD_NUMBER_MAX_LENGTH}
                        className='pr-14'
                        {...field}
                        onChange={e => handleCardNumberChange(e, field.onChange)}
                      />
                      <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                        <CardBrandIcon brand={cardBrand} size='sm' />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={cardForm.control}
                name='expiry'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billing.addPaymentMethod.expiry')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='MM/YY'
                        autoComplete='cc-exp'
                        inputMode='numeric'
                        maxLength={EXPIRY_MAX_LENGTH}
                        {...field}
                        onChange={e => handleExpiryChange(e, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={cardForm.control}
                name='cvc'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billing.addPaymentMethod.cvc')}</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showCvc ? 'text' : 'password'}
                          placeholder={cardBrand === 'amex' ? '1234' : '123'}
                          autoComplete='cc-csc'
                          inputMode='numeric'
                          maxLength={cardBrand === 'amex' ? 4 : 3}
                          className='pr-10'
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                          onClick={() => setShowCvc(!showCvc)}
                        >
                          {showCvc ? (
                            <EyeOff className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Eye className='h-4 w-4 text-muted-foreground' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg'>
              <Lock className='h-4 w-4 flex-shrink-0' />
              <span>{t('billing.addPaymentMethod.securityNotice')}</span>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button type='button' variant='outline' onClick={handleBack} disabled={loading}>
                {t('common.back')}
              </Button>
              <Button type='submit' disabled={loading || !cardForm.formState.isValid}>
                {loading ? t('common.loading') : t('billing.addPaymentMethod.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </>
    )
  }

  // Crypto step
  return (
    <>
      <Breadcrumb
        parentLabel={t('billing.addPaymentMethod.selectTitle')}
        currentLabel={t('billing.crypto.title')}
        onBack={handleBack}
        disabled={loading}
      />
      <CryptoWalletConnectContent
        onSuccess={handleCryptoSuccess}
        onBack={handleBack}
        embedded
      />
    </>
  )
}
