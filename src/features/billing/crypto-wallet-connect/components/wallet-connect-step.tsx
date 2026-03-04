import { AlertCircleIcon, Loading02Icon, Wallet01Icon } from '@untitledui/icons-react/outline'
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
  onAddWallet: () => void
  error?: string | null
}

export const WalletConnectStep = ({
  network,
  isConnected,
  isConnecting,
  address,
  onConnect,
  onDisconnect,
  onAddWallet,
  error
}: WalletConnectStepProps) => {
  const { t } = useTranslation()
  // Только TON поддерживается
  const walletName = 'TonKeeper'

  if (isConnected && address) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between p-4 rounded-lg border border-border bg-accent/30'>
          <div>
            <p className='text-sm font-medium'>{t('billing.crypto.wallet.connected')}</p>
            <p className='text-xs text-muted-foreground font-mono'>
              {shortenWalletAddress(address)}
            </p>
          </div>
          <Button variant='ghost' size='sm' onClick={onDisconnect}>
            {t('billing.crypto.wallet.disconnect')}
          </Button>
        </div>
        <p className='text-sm text-muted-foreground'>{getNetworkDisplayName(network)}</p>
        <Button onClick={onAddWallet} className='w-full' size='lg'>
          <Wallet01Icon className='h-4 w-4 mr-2' />
          {t('billing.crypto.wallet.add')}
        </Button>
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
            <Loading02Icon className='h-4 w-4 mr-2 animate-spin' />
            {t('billing.crypto.wallet.connecting')}
          </>
        ) : (
          <>
            <Wallet01Icon className='h-4 w-4 mr-2' />
            {t('billing.crypto.wallet.connect')}
          </>
        )}
      </Button>
      {error && (
        <div className='text-sm text-destructive'>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
