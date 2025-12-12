import { ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork, PlanType } from '@/entities/subscription'
import { getWalletType } from '@/entities/subscription'
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

// USDT decimals = 6
const USDT_DECIMALS = 6n

export const CryptoSubscriptionDialog = ({
  open,
  onOpenChange,
  planType,
  amount,
  onSuccess
}: CryptoSubscriptionDialogProps) => {
  const { t } = useTranslation()

  // State
  const [step, setStep] = useState<Step>('network')
  const [network, setNetwork] = useState<CryptoNetwork | null>(null)

  // Crypto wallet hook
  const wallet = useCryptoWallet(network)

  // Transaction state
  const [isApproved, setIsApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state
  const resetState = useCallback(() => {
    setStep('network')
    setNetwork(null)
    setIsApproved(false)
    setIsApproving(false)
    setIsSubscribing(false)
    setError(null)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState()
    }
    onOpenChange(newOpen)
  }

  // Network selection
  const handleNetworkSelect = (selectedNetwork: CryptoNetwork) => {
    setNetwork(selectedNetwork)
    // Reset approval state when network changes
    setIsApproved(false)
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
    setIsApproved(false)
    setError(null)
  }

  // Approve USDT spending
  const handleApprove = async () => {
    if (!network || !wallet.approve) {
      // TON doesn't need separate approve
      setIsApproved(true)
      return
    }

    setIsApproving(true)
    setError(null)

    try {
      // Convert amount to USDT smallest unit (6 decimals)
      // Approve max uint256 for convenience (standard practice)
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      await wallet.approve(maxApproval)
      setIsApproved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsApproving(false)
    }
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
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setIsSubscribing(false)
    }
  }

  // Check if network requires approve step
  const needsApprove = network ? getWalletType(network) !== 'tonconnect' : true

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
    }
  }

  const isLoading = wallet.isConnecting || isApproving || isSubscribing

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{t('billing.crypto.title')}</DialogTitle>
          <DialogDescription>{t('billing.crypto.description')}</DialogDescription>
        </DialogHeader>

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
              isApproving={isApproving}
              isSubscribing={isSubscribing}
              isApproved={isApproved || !needsApprove}
              onApprove={handleApprove}
              onSubscribe={handleSubscribe}
              needsApprove={needsApprove}
              error={error}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className='gap-2 sm:gap-0'>
          {step !== 'network' && (
            <Button variant='outline' onClick={handleBack} disabled={isLoading}>
              {t('common.back')}
            </Button>
          )}
          {step === 'network' && (
            <Button variant='outline' onClick={() => handleOpenChange(false)}>
              {t('common.cancel')}
            </Button>
          )}
          {step !== 'confirm' && (
            <Button onClick={handleNext} disabled={!canGoNext() || isLoading}>
              {t('common.next')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
