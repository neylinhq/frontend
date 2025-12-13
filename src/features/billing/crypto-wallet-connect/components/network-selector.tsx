import { useTranslation } from 'react-i18next'
import type { CryptoNetwork } from '@/entities/subscription'
import { Icon, networkIcons } from '@/shared/components/icon'
import { cn } from '@/shared/lib/cn'

interface NetworkSelectorProps {
  selected: CryptoNetwork | null
  onSelect: (network: CryptoNetwork) => void
}

export const NetworkSelector = ({ selected, onSelect }: NetworkSelectorProps) => {
  const { t } = useTranslation()
  const isSelected = selected === 'ton'
  const iconData = networkIcons.ton

  return (
    <div className='space-y-3'>
      <p className='text-sm text-muted-foreground'>{t('billing.crypto.selectNetwork')}</p>
      <div className='flex justify-center'>
        <button
          type='button'
          onClick={() => onSelect('ton')}
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all min-w-[200px]',
            'hover:border-brand hover:bg-accent/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isSelected ? 'border-brand bg-accent/50' : 'border-border bg-background'
          )}
        >
          {iconData && <Icon data={iconData} size={48} className='text-foreground' />}
          <div className='text-center'>
            <div className='text-lg font-medium'>{t('billing.crypto.networks.ton')}</div>
            <div className='text-sm text-muted-foreground'>
              {t('billing.crypto.networks.tonDescription')}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
