import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Eye, EyeOff, Lock, Plus, Wallet } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/shared/components/breadcrumb'
import { Button } from '@/shared/components/button'
import { CardBrandIcon } from '@/shared/components/card-brand-icon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/form'
import { Input } from '@/shared/components/input'
import { toast } from '@/shared/components/toast'
import {
  type CardBrand,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  parseExpiry
} from '@/shared/lib/card-utils'
import { cn } from '@/shared/lib/cn'
import type { CryptoNetwork } from '@/entities/subscription'
import { getEvmChainId, getWalletType } from '@/entities/subscription/lib/crypto-utils'
import { useCryptoWallet } from '@/features/billing/crypto-wallet-connect/model/crypto-wallet-connect.hooks'
import { NetworkConnectButtons } from '@/features/billing/crypto-wallet-connect/components/network-connect-buttons'
import { CARD_VALIDATION, getCvcLength, getCvcPlaceholder } from './lib/card-validation'
import {
  type AddPaymentMethodValues,
  addPaymentMethodSchema,
  type PaymentMethodInput
} from './lib/validation'

// Types
type Step = 'select' | 'card' | 'crypto'

interface CryptoWalletInput {
  network: CryptoNetwork
  address: string
}

interface AddPaymentMethodDialogProps {
  onAddCard: (data: PaymentMethodInput) => void
  onAddCrypto: (data: CryptoWalletInput) => void
  loadingCard?: boolean
  loadingCrypto?: boolean
  trigger?: React.ReactNode
}

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
        'hover:border-foreground/30 hover:bg-muted/30 transition-all duration-200',
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

  // Crypto wallet connection state
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const wallet = useCryptoWallet(selectedNetwork)
  const initialConnectionStateRef = useRef<boolean>(false)
  const connectionAttemptedRef = useRef<boolean>(false)

  const cardForm = useForm<AddPaymentMethodValues>({
    resolver: zodResolver(addPaymentMethodSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvc: ''
    }
  })

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

  // Handle network button click - triggers wallet provider
  const handleNetworkClick = (network: CryptoNetwork) => {
    // Prevent multiple clicks while provider is already open
    if (isConnecting) {
      toast.warning(t('billing.crypto.providerAlreadyOpen'))
      return
    }
    connectionAttemptedRef.current = false // Reset attempt flag
    setSelectedNetwork(network)
    setIsConnecting(true)
  }

  // Reset and close dialog
  const resetAndClose = useCallback(() => {
    setOpen(false)
    setStep('select')
    cardForm.reset()
    setCardBrand('unknown')
    setShowCvc(false)
    // Reset crypto state
    if (wallet.isConnected) {
      wallet.disconnect()
    }
    setSelectedNetwork(null)
    setIsConnecting(false)
  }, [wallet, cardForm])

  // Auto-trigger connection when wallet connector is ready
  useEffect(() => {
    if (!selectedNetwork || !isConnecting) return

    // Store initial connection state when we start connecting
    initialConnectionStateRef.current = wallet.isConnected

    // Wait for wallet connector to load (wallet.connect changes from empty function)
    if (!wallet.connect || wallet.connect.toString().includes('async () => {}')) return

    // Prevent duplicate connection attempts
    if (connectionAttemptedRef.current) return
    connectionAttemptedRef.current = true

    const triggerConnection = async () => {
      try {
        await wallet.connect()
        // Don't reset state here - let auto-save useEffect handle it
      } catch (err) {
        // Check error type
        const errorCode = err && typeof err === 'object' && 'code' in err ? err.code : null
        const isUserRejection = errorCode === 4001 || errorCode === 'ACTION_REJECTED'
        const isAlreadyPending = errorCode === -32002 // Request already pending

        if (isAlreadyPending) {
          // MetaMask window is already open, don't reset state
          return
        }

        if (isUserRejection) {
          setIsConnecting(false)
          setSelectedNetwork(null)
        } else {
          // For other errors, also reset
          setIsConnecting(false)
          setSelectedNetwork(null)
        }
      }
    }

    triggerConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork, isConnecting, wallet])

  // Watch for successful connection and auto-save
  useEffect(() => {
    if (!selectedNetwork || !wallet.isConnected || !wallet.address || !isConnecting) {
      return
    }

    // For EVM wallets - validate chainId
    const walletType = getWalletType(selectedNetwork)
    if (walletType === 'evm') {
      const expectedChainId = getEvmChainId(selectedNetwork)
      if (wallet.chainId !== expectedChainId) {
        return
      }
    }

    // Call parent callback to save wallet
    setIsConnecting(false)
    onAddCrypto({ network: selectedNetwork, address: wallet.address })

    // Reset state and close dialog
    wallet.disconnect()
    setSelectedNetwork(null)
    resetAndClose()
  }, [selectedNetwork, wallet.isConnected, wallet.address, wallet.chainId, isConnecting, onAddCrypto, wallet, resetAndClose])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetAndClose()
    } else {
      setOpen(true)
    }
  }

  const handleBack = () => {
    setStep('select')
    cardForm.reset()
    setCardBrand('unknown')
    // Reset crypto state
    if (wallet.isConnected) {
      wallet.disconnect()
    }
    setSelectedNetwork(null)
    setIsConnecting(false)
  }

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
              <DialogTitle>
                {t('billing.addPaymentMethod.selectTitle')}
              </DialogTitle>
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
                description='USDT (TRC-20, TON, BSC, ETH)'
                onClick={() => setStep('crypto')}
              />
            </div>
          </>
        )}

        {/* Card Step */}
        {step === 'card' && (
          <>
            <DialogHeader>
              <Breadcrumb onBack={handleBack} disabled={loadingCard} className='mb-4' />
              <DialogTitle>{t('billing.addPaymentMethod.title')}</DialogTitle>
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

        {/* Crypto Step - Network Selection */}
        {step === 'crypto' && (
          <>
            <DialogHeader>
              <Breadcrumb onBack={handleBack} disabled={loadingCrypto || isConnecting} className='mb-4' />
              <DialogTitle>{t('billing.crypto.title')}</DialogTitle>
              <DialogDescription>{t('billing.crypto.description')}</DialogDescription>
            </DialogHeader>

            {/* Hidden wallet connector */}
            {wallet._connector && <div className='hidden'>{wallet._connector}</div>}

            <div className='py-4'>
              <NetworkConnectButtons
                onNetworkClick={handleNetworkClick}
                loadingNetwork={isConnecting ? selectedNetwork : null}
                disabled={loadingCrypto}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
