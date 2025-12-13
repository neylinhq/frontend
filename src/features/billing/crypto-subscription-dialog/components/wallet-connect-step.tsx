import { Loader2, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork } from '@/entities/subscription'
import { getNetworkDisplayName, shortenWalletAddress } from '@/entities/subscription'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

interface WalletConnectStepProps {
  network: CryptoNetwork
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  onConnect: () => void
  onDisconnect: () => void
}

export const WalletConnectStep = ({
  network,
  isConnected,
  isConnecting,
  address,
  onConnect,
  onDisconnect
}: WalletConnectStepProps) => {
  const { t } = useTranslation()
  // Только TON поддерживается
  const walletName = 'TonKeeper'

  if (isConnected && address) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between p-4 rounded-lg border border-border bg-accent/30'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10'>
              <Wallet className='h-5 w-5 text-green-500' />
            </div>
            <div>
              <p className='text-sm font-medium'>{t('billing.crypto.wallet.connected')}</p>
              <p className='text-xs text-muted-foreground font-mono'>
                {shortenWalletAddress(address)}
              </p>
            </div>
          </div>
          <Button variant='ghost' size='sm' onClick={onDisconnect}>
            {t('billing.crypto.wallet.disconnect')}
          </Button>
        </div>
        <p className='text-sm text-muted-foreground'>
          {getNetworkDisplayName(network)}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>
        {t('billing.crypto.wallet.connect')} {walletName}
      </p>
      <Button
        onClick={onConnect}
        disabled={isConnecting}
        className={cn('w-full', isConnecting && 'opacity-70')}
        size='lg'
      >
        {isConnecting ? (
          <>
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            {t('billing.crypto.wallet.connecting')}
          </>
        ) : (
          <>
            <Wallet className='h-4 w-4 mr-2' />
            {t('billing.crypto.wallet.connect')}
          </>
        )}
      </Button>
    </div>
  )
}
