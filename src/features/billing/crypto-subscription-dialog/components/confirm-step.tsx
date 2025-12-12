import { AlertCircle, Check, Loader2, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork, PlanType } from '@/entities/subscription'
import { getNetworkDisplayName, shortenWalletAddress } from '@/entities/subscription'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

interface ConfirmStepProps {
  network: CryptoNetwork
  address: string
  planType: PlanType
  amount: number
  isApproving: boolean
  isSubscribing: boolean
  isApproved: boolean
  onApprove: () => void
  onSubscribe: () => void
  needsApprove?: boolean
  error?: string | null
}

export const ConfirmStep = ({
  network,
  address,
  planType,
  amount,
  isApproving,
  isSubscribing,
  isApproved,
  onApprove,
  onSubscribe,
  needsApprove = true,
  error
}: ConfirmStepProps) => {
  const { t } = useTranslation()
  const isLoading = isApproving || isSubscribing

  // For TON, we skip the approve step entirely
  const showApproveStep = needsApprove

  return (
    <div className='space-y-6'>
      {/* Error message */}
      {error && (
        <div className='flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg'>
          <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
          <span>{error}</span>
        </div>
      )}

      {/* Summary */}
      <div className='p-4 rounded-lg border border-border bg-accent/30 space-y-3'>
        <div className='flex justify-between text-sm'>
          <span className='text-muted-foreground'>{t('billing.crypto.plan')}</span>
          <span className='font-medium capitalize'>{planType}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-muted-foreground'>{t('billing.crypto.amount')}</span>
          <span className='font-medium'>{amount} USDT / {t('billing.month')}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-muted-foreground'>{t('billing.crypto.network')}</span>
          <span className='font-medium'>{getNetworkDisplayName(network)}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-muted-foreground'>{t('billing.crypto.wallet')}</span>
          <span className='font-medium font-mono'>{shortenWalletAddress(address)}</span>
        </div>
      </div>

      {/* Steps */}
      <div className='space-y-3'>
        {/* Step 1: Approve (only for EVM/Tron) */}
        {showApproveStep && (
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-lg border',
            isApproved ? 'border-green-500/50 bg-green-500/5' : 'border-border'
          )}>
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              isApproved ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            )}>
              {isApproved ? <Check className='h-4 w-4' /> : '1'}
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium'>{t('billing.crypto.approveTitle')}</p>
              <p className='text-xs text-muted-foreground'>
                {t('billing.crypto.approveDescription')}
              </p>
            </div>
            {!isApproved && (
              <Button
                size='sm'
                onClick={onApprove}
                disabled={isLoading}
              >
                {isApproving ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  t('billing.crypto.approve')
                )}
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Subscribe (or Step 1 for TON) */}
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-lg border',
          showApproveStep && !isApproved && 'opacity-50',
          'border-border'
        )}>
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
            'bg-muted text-muted-foreground'
          )}>
            {showApproveStep ? '2' : '1'}
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium'>{t('billing.crypto.subscribeTitle')}</p>
            <p className='text-xs text-muted-foreground'>
              {t('billing.crypto.subscribeDescription', { amount })}
            </p>
          </div>
          <Button
            size='sm'
            onClick={onSubscribe}
            disabled={(showApproveStep && !isApproved) || isLoading}
          >
            {isSubscribing ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              t('billing.crypto.subscribe')
            )}
          </Button>
        </div>
      </div>

      {/* Security notice */}
      <div className='flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg'>
        <Shield className='h-4 w-4 flex-shrink-0 mt-0.5' />
        <span>{t('billing.crypto.securityNotice')}</span>
      </div>
    </div>
  )
}
