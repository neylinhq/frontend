import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork, PlanType } from '@/entities/subscription'
import { getNetworkDisplayName, shortenWalletAddress } from '@/entities/subscription'
import { Button } from '@/shared/components/button'

interface ConfirmStepProps {
  network: CryptoNetwork
  address: string
  planType: PlanType
  amount: number
  isSubscribing: boolean
  onSubscribe: () => void
  error?: string | null
}

export const ConfirmStep = ({
  network,
  address,
  planType,
  amount,
  isSubscribing,
  onSubscribe,
  error
}: ConfirmStepProps) => {
  const { t } = useTranslation()

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
          <span className='text-muted-foreground'>{t('billing.crypto.confirm.plan')}</span>
          <span className='font-medium capitalize'>{planType}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-muted-foreground'>{t('billing.crypto.confirm.amount')}</span>
          <span className='font-medium'>{amount} USDT</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-muted-foreground'>{t('billing.crypto.confirm.network')}</span>
          <span className='font-medium'>{getNetworkDisplayName(network)}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-muted-foreground'>{t('billing.crypto.confirm.wallet')}</span>
          <span className='font-medium font-mono'>{shortenWalletAddress(address)}</span>
        </div>
      </div>

      {/* Subscribe button */}
      <Button
        className='w-full'
        size='lg'
        onClick={onSubscribe}
        disabled={isSubscribing}
      >
        {isSubscribing ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
            {t('billing.crypto.confirm.subscribing')}
          </>
        ) : (
          t('billing.crypto.confirm.subscribe')
        )}
      </Button>

      {/* Security notice */}
      <div className='flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg'>
        <Shield className='h-4 w-4 flex-shrink-0 mt-0.5' />
        <span>{t('billing.addPaymentMethod.securityNotice')}</span>
      </div>
    </div>
  )
}
