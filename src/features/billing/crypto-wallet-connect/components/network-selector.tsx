import { useTranslation } from 'react-i18next'

import type { CryptoNetwork } from '@/entities/subscription'
import { Icon, networkIcons } from '@/shared/components/icon'
import { cn } from '@/shared/lib/cn'

interface NetworkSelectorProps {
  selected: CryptoNetwork | null
  onSelect: (network: CryptoNetwork) => void
}

const NETWORKS: Array<{ id: CryptoNetwork; translationKey: string; descriptionKey: string }> = [
  {
    id: 'ton',
    translationKey: 'billing.crypto.networks.ton',
    descriptionKey: 'billing.crypto.networks.tonDescription'
  },
  {
    id: 'tron',
    translationKey: 'billing.crypto.networks.tron',
    descriptionKey: 'billing.crypto.networks.tronDescription'
  },
  {
    id: 'ethereum',
    translationKey: 'billing.crypto.networks.ethereum',
    descriptionKey: 'billing.crypto.networks.ethereumDescription'
  },
  {
    id: 'bsc',
    translationKey: 'billing.crypto.networks.bsc',
    descriptionKey: 'billing.crypto.networks.bscDescription'
  }
  // { id: 'polygon', translationKey: 'billing.crypto.networks.polygon', descriptionKey: 'billing.crypto.networks.polygonDescription' }
]

export const NetworkSelector = ({ selected, onSelect }: NetworkSelectorProps) => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-2 gap-3'>
      {NETWORKS.map(network => {
        const isSelected = selected === network.id
        const iconData = networkIcons[network.id]

        return (
          <button
            key={network.id}
            type='button'
            onClick={() => onSelect(network.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
              'hover:border-brand hover:bg-accent/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected ? 'border-brand bg-accent/50' : 'border-border bg-background'
            )}
          >
            {iconData && <Icon data={iconData} size={32} className='text-foreground' />}
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
