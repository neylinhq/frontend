import { useTranslation } from 'react-i18next'
import type { CryptoNetwork } from '@/entities/subscription'
import { getNetworkDisplayName, getNetworkFeeEstimate } from '@/entities/subscription'
import { Icon, networkIcons } from '@/shared/components/icon'
import { cn } from '@/shared/lib/cn'

interface NetworkSelectorProps {
  selected: CryptoNetwork | null
  onSelect: (network: CryptoNetwork) => void
}

const NETWORKS: CryptoNetwork[] = ['ton', 'tron', 'bsc', 'polygon', 'ethereum']

export const NetworkSelector = ({ selected, onSelect }: NetworkSelectorProps) => {
  const { t } = useTranslation()

  return (
    <div className='space-y-3'>
      <p className='text-sm text-muted-foreground'>
        {t('billing.crypto.selectNetwork')}
      </p>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {NETWORKS.map(network => {
          const isSelected = selected === network
          const iconData = networkIcons[network]

          return (
            <button
              key={network}
              type='button'
              onClick={() => onSelect(network)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                'hover:border-brand hover:bg-accent/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-brand bg-accent/50'
                  : 'border-border bg-background'
              )}
            >
              {iconData && (
                <Icon data={iconData} size={32} className='text-foreground' />
              )}
              <div className='text-center'>
                <div className='text-sm font-medium'>{getNetworkDisplayName(network)}</div>
                <div className='text-xs text-muted-foreground'>
                  {t('billing.crypto.fee')}: {getNetworkFeeEstimate(network)}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
