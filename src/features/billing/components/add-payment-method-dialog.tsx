import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight, CreditCard, Eye, EyeOff, Lock, Plus, Wallet } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { CryptoCurrency, CryptoNetwork } from '@/entities/subscription'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/form'
import { cryptoIcons, Icon } from '@/shared/components/icon'
import { Input } from '@/shared/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select'
import {
  type CardBrand,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  parseExpiry
} from '../lib/card-utils'
import { CARD_VALIDATION, getCvcLength, getCvcPlaceholder } from '../lib/card-validation'
import {
  getCurrencyDisplayName,
  getNetworkDisplayName,
  isValidWalletAddress,
  shortenWalletAddress
} from '../lib/crypto-utils'
import {
  type AddPaymentMethodValues,
  addPaymentMethodSchema,
  type PaymentMethodInput
} from '../lib/validation'
import { CardBrandIcon } from './card-brand-icon'

// Types
type Step = 'select' | 'card' | 'crypto'

export interface CryptoWalletInput {
  currency: CryptoCurrency
  network: CryptoNetwork
  walletAddress: string
  walletAddressShort: string
}

interface AddPaymentMethodDialogProps {
  onAddCard: (data: PaymentMethodInput) => void
  onAddCrypto: (data: CryptoWalletInput) => void
  loadingCard?: boolean
  loadingCrypto?: boolean
  trigger?: React.ReactNode
}

// Crypto options
const CRYPTO_OPTIONS: { currency: CryptoCurrency; network: CryptoNetwork }[] = [
  { currency: 'BTC', network: 'bitcoin' },
  { currency: 'ETH', network: 'ethereum' },
  { currency: 'USDT', network: 'ethereum' },
  { currency: 'USDC', network: 'ethereum' },
  { currency: 'SOL', network: 'solana' }
]

const addCryptoWalletSchema = z.object({
  currency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'SOL']),
  walletAddress: z.string().min(20, 'Invalid wallet address')
})

type AddCryptoWalletValues = z.infer<typeof addCryptoWalletSchema>

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

const DialogBreadcrumb = ({
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

const SecurityNotice = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg'>
      <Lock className='h-4 w-4 flex-shrink-0' />
      <span>{children}</span>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export const AddPaymentMethodDialog = ({
  onAddCard,
  onAddCrypto,
  loadingCard,
  loadingCrypto,
  trigger
}: AddPaymentMethodDialogProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('select')

  // Card form state
  const [showCvc, setShowCvc] = useState(false)
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown')

  const cardForm = useForm<AddPaymentMethodValues>({
    resolver: zodResolver(addPaymentMethodSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvc: ''
    }
  })

  // Crypto form state
  const cryptoForm = useForm<AddCryptoWalletValues>({
    resolver: zodResolver(addCryptoWalletSchema),
    defaultValues: {
      currency: 'ETH',
      walletAddress: ''
    }
  })

  const selectedCurrency = cryptoForm.watch('currency')
  const selectedOption = CRYPTO_OPTIONS.find(o => o.currency === selectedCurrency)
  const selectedNetwork = selectedOption?.network || 'ethereum'

  // Handlers
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

  const handleCardSubmit = (values: AddPaymentMethodValues) => {
    const parsedExpiry = parseExpiry(values.expiry)
    if (!parsedExpiry) {
      return
    }

    if (cardBrand === 'unknown') {
      return
    }

    const cardDigits = values.cardNumber.replace(/\D/g, '')

    const input: PaymentMethodInput = {
      cardholderName: values.cardholderName,
      cardNumber: cardDigits.slice(-4),
      brand: cardBrand,
      expiryMonth: parseInt(parsedExpiry.month, 10),
      expiryYear: parseInt(parsedExpiry.year, 10)
    }

    onAddCard(input)
    resetAndClose()
  }

  const handleCryptoSubmit = (values: AddCryptoWalletValues) => {
    const network = CRYPTO_OPTIONS.find(o => o.currency === values.currency)?.network || 'ethereum'

    if (!isValidWalletAddress(values.walletAddress, network)) {
      cryptoForm.setError('walletAddress', {
        type: 'manual',
        message: t('billing.addCryptoWallet.invalidAddress')
      })
      return
    }

    onAddCrypto({
      currency: values.currency,
      network,
      walletAddress: values.walletAddress,
      walletAddressShort: shortenWalletAddress(values.walletAddress)
    })

    resetAndClose()
  }

  const resetAndClose = () => {
    setOpen(false)
    setStep('select')
    cardForm.reset()
    cryptoForm.reset()
    setCardBrand('unknown')
    setShowCvc(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetAndClose()
    } else {
      setOpen(true)
    }
  }

  const handleBack = () => {
    setStep('select')
    // Reset forms when going back
    cardForm.reset()
    cryptoForm.reset()
    setCardBrand('unknown')
  }

  const loading = loadingCard || loadingCrypto

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            {t('settings.billing.paymentMethods.add')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-[480px]'>
        {/* Selection Step */}
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle>{t('billing.addPaymentMethod.selectTitle')}</DialogTitle>
              <DialogDescription>
                {t('billing.addPaymentMethod.selectDescription')}
              </DialogDescription>
            </DialogHeader>

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
          </>
        )}

        {/* Card Step */}
        {step === 'card' && (
          <>
            <DialogHeader>
              <DialogBreadcrumb
                parentLabel={t('billing.addPaymentMethod.selectTitle')}
                currentLabel={t('billing.addPaymentMethod.cardTitle')}
                onBack={handleBack}
                disabled={loading}
              />
              <DialogDescription>{t('billing.addPaymentMethod.description')}</DialogDescription>
            </DialogHeader>

            <Form {...cardForm}>
              <form onSubmit={cardForm.handleSubmit(handleCardSubmit)} className='space-y-4'>
                {/* Cardholder Name */}
                <FormField
                  control={cardForm.control}
                  name='cardholderName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('billing.addPaymentMethod.cardholderName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.placeholders.name')}
                          autoComplete='cc-name'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Card Number */}
                <FormField
                  control={cardForm.control}
                  name='cardNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('billing.addPaymentMethod.cardNumber')}</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            placeholder={CARD_VALIDATION.CARD_NUMBER_PLACEHOLDER}
                            autoComplete='cc-number'
                            inputMode='numeric'
                            maxLength={CARD_VALIDATION.CARD_NUMBER_MAX_LENGTH}
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

                {/* Expiry and CVC */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={cardForm.control}
                    name='expiry'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('billing.addPaymentMethod.expiry')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={CARD_VALIDATION.EXPIRY_PLACEHOLDER}
                            autoComplete='cc-exp'
                            inputMode='numeric'
                            maxLength={CARD_VALIDATION.EXPIRY_MAX_LENGTH}
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
                        <FormLabel className='flex items-center gap-1'>
                          {t('billing.addPaymentMethod.cvc')}
                          <Lock className='h-3 w-3 text-muted-foreground' />
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type={showCvc ? 'text' : 'password'}
                              placeholder={getCvcPlaceholder(cardBrand)}
                              autoComplete='cc-csc'
                              inputMode='numeric'
                              maxLength={getCvcLength(cardBrand)}
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

                <SecurityNotice>{t('billing.addPaymentMethod.securityNotice')}</SecurityNotice>

                <DialogFooter className='gap-2 sm:gap-0'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={resetAndClose}
                    disabled={loadingCard}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type='submit'
                    disabled={loadingCard || !cardForm.formState.isValid}
                    className={cn(loadingCard && 'opacity-70')}
                  >
                    {loadingCard ? (
                      <>
                        <span className='animate-spin mr-2'>⏳</span>
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <CreditCard className='h-4 w-4 mr-2' />
                        {t('billing.addPaymentMethod.submit')}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}

        {/* Crypto Step */}
        {step === 'crypto' && (
          <>
            <DialogHeader>
              <DialogBreadcrumb
                parentLabel={t('billing.addPaymentMethod.selectTitle')}
                currentLabel={t('billing.addPaymentMethod.cryptoTitle')}
                onBack={handleBack}
                disabled={loading}
              />
              <DialogDescription>{t('billing.addCryptoWallet.description')}</DialogDescription>
            </DialogHeader>

            <Form {...cryptoForm}>
              <form onSubmit={cryptoForm.handleSubmit(handleCryptoSubmit)} className='space-y-4'>
                <FormField
                  control={cryptoForm.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('billing.currency')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('billing.addCryptoWallet.selectCurrency')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CRYPTO_OPTIONS.map(option => {
                            const iconData = cryptoIcons[option.currency.toLowerCase()]
                            return (
                              <SelectItem key={option.currency} value={option.currency}>
                                <div className='flex items-center gap-2'>
                                  {iconData && (
                                    <Icon data={iconData} size={16} className='text-foreground' />
                                  )}
                                  <span>{getCurrencyDisplayName(option.currency)}</span>
                                  <span className='text-muted-foreground'>({option.currency})</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='text-sm text-muted-foreground'>
                  {t('billing.network')}: {getNetworkDisplayName(selectedNetwork)}
                </div>

                <FormField
                  control={cryptoForm.control}
                  name='walletAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('billing.walletAddress')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('billing.addCryptoWallet.addressPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className='gap-2 sm:gap-0'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={resetAndClose}
                    disabled={loadingCrypto}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type='submit' disabled={loadingCrypto}>
                    {loadingCrypto ? (
                      <>
                        <span className='animate-spin mr-2'>⏳</span>
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <Wallet className='h-4 w-4 mr-2' />
                        {t('billing.addCryptoWallet.submit')}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
