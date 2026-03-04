import { Loading02Icon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CryptoNetwork } from '@/entities/subscription'
import { Icon, networkIcons } from '@/shared/components/icon'
import { cn } from '@/shared/lib/cn'

interface NetworkConnectButtonsProps {
  onNetworkClick: (network: CryptoNetwork) => void
  loadingNetwork: CryptoNetwork | null
  disabled?: boolean
}

const NETWORKS: Array<{ id: CryptoNetwork; translationKey: string; descriptionKey: string }> = [
  {
    id: 'tron',
    translationKey: 'billing.crypto.networks.tron',
    descriptionKey: 'billing.crypto.networks.tronDescription'
  },
  {
    id: 'bsc',
    translationKey: 'billing.crypto.networks.bsc',
    descriptionKey: 'billing.crypto.networks.bscDescription'
  },
  {
    id: 'ethereum',
    translationKey: 'billing.crypto.networks.ethereum',
    descriptionKey: 'billing.crypto.networks.ethereumDescription'
  },
  {
    id: 'ton',
    translationKey: 'billing.crypto.networks.ton',
    descriptionKey: 'billing.crypto.networks.tonDescription'
  }
]

export const NetworkConnectButtons = ({
  onNetworkClick,
  loadingNetwork,
  disabled
}: NetworkConnectButtonsProps) => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-2 gap-3'>
      {NETWORKS.map(network => {
        const isLoading = loadingNetwork === network.id
        const iconData = networkIcons[network.id]
        const isDisabled = disabled || (loadingNetwork !== null && !isLoading)

        return (
          <button
            key={network.id}
            type='button'
            onClick={() => onNetworkClick(network.id)}
            disabled={isDisabled}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              'hover:border-brand hover:bg-accent/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-background',
              isLoading ? 'border-brand bg-accent/50' : 'border-border bg-background'
            )}
          >
            {isLoading ? (
              <Loading02Icon className='h-8 w-8 animate-spin text-brand' />
            ) : (
              iconData && <Icon data={iconData} size={32} className='text-foreground' />
            )}
            <div className='text-center'>
              <div className='text-sm font-medium'>{t(network.translationKey)}</div>
              <div className='text-xs text-muted-foreground'>{t(network.descriptionKey)}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
