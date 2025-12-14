import { ChevronRight, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork } from '@/entities/subscription'
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
import { NetworkSelector } from './components/network-selector'
import { WalletConnectStep } from './components/wallet-connect-step'
import { useCryptoWallet } from './lib/use-crypto-wallet'

type Step = 'network' | 'wallet'

interface CryptoWalletConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (network: CryptoNetwork, address: string) => void
}

interface CryptoWalletConnectContentProps {
  onSuccess: (network: CryptoNetwork, address: string) => void
  onBack?: () => void
  embedded?: boolean
}

const STEPS: Step[] = ['network', 'wallet']

const StepIndicator = ({
  steps,
  currentStep,
  onStepClick
}: {
  steps: Step[]
  currentStep: Step
  onStepClick: (step: Step) => void
}) => {
  const { t } = useTranslation()
  const currentIndex = steps.indexOf(currentStep)

  const labels: Record<Step, string> = {
    network: t('billing.crypto.steps.network'),
    wallet: t('billing.crypto.steps.wallet')
  }

  return (
    <div className='flex items-center gap-1 text-sm'>
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isPast = index < currentIndex

        return (
          <div key={step} className='flex items-center'>
            <button
              type='button'
              onClick={() => isPast && onStepClick(step)}
              disabled={!isPast}
              className={cn(
                'transition-colors text-muted-foreground',
                isActive && 'text-foreground font-medium',
                isPast && 'hover:text-foreground cursor-pointer',
                !isPast && 'cursor-default'
              )}
            >
              {labels[step]}
            </button>
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
export const CryptoWalletConnectDialog = (props: CryptoWalletConnectDialogProps) => {
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
        <CryptoWalletConnectContent onSuccess={props.onSuccess} />
      </DialogContent>
    </Dialog>
  )
}

/**
 * Inner component that uses wallet hooks - can be used standalone (embedded) or inside dialog
 * Only handles wallet connection, NOT payment
 */
export const CryptoWalletConnectContent = ({
  onSuccess,
  onBack: externalOnBack,
  embedded = false
}: CryptoWalletConnectContentProps) => {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // State
  const [step, setStep] = useState<Step>('network')
  const [network, setNetwork] = useState<CryptoNetwork | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Crypto wallet hook - safe to call here, after hydration
  const wallet = useCryptoWallet(network)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Автоматически добавляем кошелек после подключения
  useEffect(() => {
    if (network && wallet.isConnected && wallet.address) {
      console.log('[CryptoWalletConnect] Wallet connected, auto-adding to payment methods')
      onSuccess(network, wallet.address)
    }
  }, [network, wallet.isConnected, wallet.address, onSuccess])

  // Reset state
  const resetState = useCallback(() => {
    setStep('network')
    setNetwork(null)
    setError(null)
  }, [])

  // Network selection
  const handleNetworkSelect = (selectedNetwork: CryptoNetwork) => {
    setNetwork(selectedNetwork)
    setError(null)
    // Automatically go to wallet step
    setStep('wallet')
  }

  // Wallet connection
  const handleConnect = async () => {
    if (!network) {
      return
    }
    setError(null)

    try {
      await wallet.connect()
      // onSuccess will be called automatically by useEffect when wallet.isConnected becomes true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    }
  }

  const handleDisconnect = () => {
    wallet.disconnect()
    setError(null)
  }

  // Navigation
  const handleBack = () => {
    const currentIndex = STEPS.indexOf(step)
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1])
    } else if (externalOnBack) {
      // На первом шаге — вернуться к выбору способа оплаты
      externalOnBack()
    }
  }

  const canSubmit = wallet.isConnected && wallet.address !== null

  const isLoading = wallet.isConnecting

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
        <StepIndicator steps={STEPS} currentStep={step} onStepClick={setStep} />
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
            error={error}
          />
        )}
      </div>

    </>
  )
}
