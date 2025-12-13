import { ChevronRight, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork, PlanType } from '@/entities/subscription'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'
import { cn } from '@/shared/lib/cn'
import { ConfirmStep } from './components/confirm-step'
import { NetworkSelector } from './components/network-selector'
import { WalletConnectStep } from './components/wallet-connect-step'
import { useCryptoWallet } from './lib/use-crypto-wallet'

type Step = 'network' | 'wallet' | 'confirm'

interface CryptoSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planType: PlanType
  amount: number
  onSuccess: () => void
}

interface CryptoSubscriptionDialogContentProps {
  planType: PlanType
  amount: number
  onSuccess: () => void
  onBack?: () => void
  embedded?: boolean
}

const STEPS: Step[] = ['network', 'wallet', 'confirm']

const StepIndicator = ({ steps, currentStep }: { steps: Step[]; currentStep: Step }) => {
  const { t } = useTranslation()
  const currentIndex = steps.indexOf(currentStep)

  const labels: Record<Step, string> = {
    network: t('billing.crypto.steps.network'),
    wallet: t('billing.crypto.steps.wallet'),
    confirm: t('billing.crypto.steps.confirm')
  }

  return (
    <div className='flex items-center gap-1 text-sm'>
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex

        return (
          <div key={step} className='flex items-center'>
            <span
              className={cn(
                'transition-colors',
                isActive && 'text-foreground font-medium',
                isCompleted && 'text-brand',
                !isActive && !isCompleted && 'text-muted-foreground'
              )}
            >
              {labels[step]}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className='h-4 w-4 mx-1 text-muted-foreground' />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * SSR-safe wrapper - only renders the content that uses wallet hooks on client
 */
export const CryptoSubscriptionDialog = (props: CryptoSubscriptionDialogProps) => {
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Before hydration, show a simple loading dialog
  if (!mounted) {
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>{t('billing.crypto.title')}</DialogTitle>
            <DialogDescription>{t('billing.crypto.description')}</DialogDescription>
          </DialogHeader>
          <div className='py-8 flex items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{t('billing.crypto.title')}</DialogTitle>
          <DialogDescription>{t('billing.crypto.description')}</DialogDescription>
        </DialogHeader>
        <CryptoSubscriptionDialogContent
          planType={props.planType}
          amount={props.amount}
          onSuccess={props.onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}

/**
 * Inner component that uses wallet hooks - can be used standalone (embedded) or inside dialog
 */
export const CryptoSubscriptionDialogContent = ({
  planType,
  amount,
  onSuccess,
  onBack: externalOnBack,
  embedded = false
}: CryptoSubscriptionDialogContentProps) => {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // State
  const [step, setStep] = useState<Step>('network')
  const [network, setNetwork] = useState<CryptoNetwork | null>(null)

  // Crypto wallet hook - safe to call here, after hydration
  const wallet = useCryptoWallet(network)

  // Transaction state
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset state
  const resetState = useCallback(() => {
    setStep('network')
    setNetwork(null)
    setIsSubscribing(false)
    setError(null)
  }, [])

  // Network selection
  const handleNetworkSelect = (selectedNetwork: CryptoNetwork) => {
    setNetwork(selectedNetwork)
    setError(null)
  }

  // Wallet connection
  const handleConnect = async () => {
    if (!network) return
    setError(null)

    try {
      await wallet.connect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    }
  }

  const handleDisconnect = () => {
    wallet.disconnect()
    setError(null)
  }

  // Subscribe
  const handleSubscribe = async () => {
    if (!network) return

    setIsSubscribing(true)
    setError(null)

    try {
      // Generate order ID (in production this comes from backend)
      const orderId = crypto.randomUUID()

      // Convert amount to smallest unit (6 decimals for USDT)
      const amountInSmallestUnit = BigInt(Math.round(amount * 10 ** 6))

      await wallet.subscribe(orderId, amountInSmallestUnit)
      onSuccess()
      resetState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setIsSubscribing(false)
    }
  }

  // Navigation
  const canGoNext = () => {
    switch (step) {
      case 'network':
        return network !== null
      case 'wallet':
        return wallet.isConnected && wallet.address !== null
      case 'confirm':
        return false
    }
  }

  const handleNext = () => {
    const currentIndex = STEPS.indexOf(step)
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step)
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1])
    } else if (externalOnBack) {
      // На первом шаге — вернуться к выбору способа оплаты
      externalOnBack()
    }
  }

  const isLoading = wallet.isConnecting || isSubscribing

  // Скрытый элемент-коннектор для управления кошельком
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WalletConnector = (wallet as any)._connector

  // Before mount, show loading
  if (!mounted) {
    return (
      <div className='py-8 flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <>
      {/* Скрытый коннектор кошелька */}
      {WalletConnector}

      {/* Step indicator */}
      <div className='py-2'>
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Content */}
      <div className='py-4'>
        {step === 'network' && (
          <NetworkSelector selected={network} onSelect={handleNetworkSelect} />
        )}

        {step === 'wallet' && network && (
          <WalletConnectStep
            network={network}
            isConnected={wallet.isConnected}
            isConnecting={wallet.isConnecting}
            address={wallet.address}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        )}

        {step === 'confirm' && network && wallet.address && (
          <ConfirmStep
            network={network}
            address={wallet.address}
            planType={planType}
            amount={amount}
            isSubscribing={isSubscribing}
            onSubscribe={handleSubscribe}
            error={error}
          />
        )}
      </div>

      {/* Footer */}
      <DialogFooter className='gap-2 sm:gap-0'>
        {(step !== 'network' || embedded) && (
          <Button variant='outline' onClick={handleBack} disabled={isLoading}>
            {t('common.back')}
          </Button>
        )}
        {step !== 'confirm' && (
          <Button onClick={handleNext} disabled={!canGoNext() || isLoading}>
            {t('common.next')}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}
