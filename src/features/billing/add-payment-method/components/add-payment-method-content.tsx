import { zodResolver } from '@hookform/resolvers/zod'
import {
  CreditCard01Icon,
  EyeIcon,
  EyeOffIcon,
  Lock01Icon,
  Wallet01Icon
} from '@untitledui/icons-react/outline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { NetworkConnectButtons, useCryptoWallet } from '@/features/billing/crypto-wallet-connect'
import { type CryptoNetwork, getEvmChainId, getWalletType } from '@/entities/subscription'
import { Breadcrumb } from '@/shared/components/breadcrumb'
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
import { toast } from '@/shared/components/toast'
import {
  type CardBrand,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  parseExpiry
} from '@/shared/lib/card-utils'
import { cn } from '@/shared/lib/cn'

import { CARD_VALIDATION, getCvcLength, getCvcPlaceholder } from '../lib/card-validation'
import {
  type AddPaymentMethodValues,
  addPaymentMethodSchema,
  type PaymentMethodInput
} from '../lib/validation'

export interface CryptoWalletInput {
  network: CryptoNetwork
  address: string
}

interface AddPaymentMethodContentProps {
  onAddCard: (data: PaymentMethodInput) => void
  onAddCrypto: (data: CryptoWalletInput) => void
  loading?: boolean
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

type Step = 'select' | 'card' | 'crypto'

export const AddPaymentMethodContent = ({
  onAddCard,
  onAddCrypto,
  loading
}: AddPaymentMethodContentProps) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('select')
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

  // Crypto wallet connection state
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const wallet = useCryptoWallet(selectedNetwork)
  const initialConnectionStateRef = useRef<boolean>(false)
  const connectionAttemptedRef = useRef<boolean>(false)

  const handleNetworkClick = (network: CryptoNetwork) => {
    if (isConnecting) {
      toast.warning(t('billing.crypto.providerAlreadyOpen'))
      return
    }
    connectionAttemptedRef.current = false
    setSelectedNetwork(network)
    setIsConnecting(true)
  }

  // Auto-trigger connection when wallet connector is ready
  useEffect(() => {
    if (!selectedNetwork || !isConnecting) return

    initialConnectionStateRef.current = wallet.isConnected

    if (!wallet.connect || wallet.connect.toString().includes('async () => {}')) return

    if (connectionAttemptedRef.current) return
    connectionAttemptedRef.current = true

    const triggerConnection = async () => {
      try {
        await wallet.connect()
      } catch (err) {
        const errorCode = err && typeof err === 'object' && 'code' in err ? err.code : null
        const isUserRejection = errorCode === 4001 || errorCode === 'ACTION_REJECTED'
        const isAlreadyPending = errorCode === -32002

        if (isAlreadyPending) return

        if (isUserRejection) {
          setIsConnecting(false)
          setSelectedNetwork(null)
        } else {
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

    const walletType = getWalletType(selectedNetwork)
    if (walletType === 'evm') {
      const expectedChainId = getEvmChainId(selectedNetwork)
      if (wallet.chainId !== expectedChainId) {
        return
      }
    }

    setIsConnecting(false)
    onAddCrypto({ network: selectedNetwork, address: wallet.address })

    wallet.disconnect()
    setSelectedNetwork(null)
  }, [
    selectedNetwork,
    wallet.isConnected,
    wallet.address,
    wallet.chainId,
    isConnecting,
    onAddCrypto,
    wallet
  ])

  const handleBack = () => {
    setStep('select')
    cardForm.reset()
    setCardBrand('unknown')

    if (wallet.isConnected) {
      wallet.disconnect()
    }
    setSelectedNetwork(null)
    setIsConnecting(false)
  }

  // Selection step
  if (step === 'select') {
    return (
      <div className='grid grid-cols-2 gap-4 py-4'>
        <SelectionCard
          icon={<CreditCard01Icon className='h-12 w-12' />}
          title={t('billing.addPaymentMethod.cardOption.title')}
          description={t('billing.addPaymentMethod.cardOption.description')}
          onClick={() => setStep('card')}
        />
        <SelectionCard
          icon={<Wallet01Icon className='h-12 w-12' />}
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
        <Breadcrumb onBack={handleBack} disabled={loading} className='mb-4' />

        <Form {...cardForm}>
          <form onSubmit={cardForm.handleSubmit(handleCardSubmit)} className='space-y-4'>
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
                      <Lock01Icon className='h-3 w-3 text-muted-foreground' />
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
                            <EyeOffIcon className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <EyeIcon className='h-4 w-4 text-muted-foreground' />
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
              <Lock01Icon className='h-4 w-4 flex-shrink-0' />
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
  const WalletConnector = wallet._connector

  return (
    <>
      {WalletConnector && <div className='hidden'>{WalletConnector}</div>}

      <Breadcrumb onBack={handleBack} disabled={loading || isConnecting} className='mb-4' />
      <div className='py-4'>
        <NetworkConnectButtons
          onNetworkClick={handleNetworkClick}
          loadingNetwork={isConnecting ? selectedNetwork : null}
          disabled={loading}
        />
      </div>
    </>
  )
}
