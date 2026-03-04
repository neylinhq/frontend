import { Mail01Icon, Send01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { SUPPORT_CONTACTS } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

type SupportLinksVariant = 'buttons' | 'links' | 'icons'

interface SupportLinksProps {
  variant?: SupportLinksVariant
  className?: string
}

export const SupportLinks = ({ variant = 'buttons', className }: SupportLinksProps) => {
  const { t } = useTranslation()

  if (variant === 'icons') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button variant='ghost' size='icon' asChild>
          <a
            href={SUPPORT_CONTACTS.telegram.url}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={SUPPORT_CONTACTS.telegram.label}
          >
            <Send01Icon className='h-4 w-4' />
          </a>
        </Button>
        <Button variant='ghost' size='icon' asChild>
          <a href={SUPPORT_CONTACTS.email.url} aria-label={SUPPORT_CONTACTS.email.label}>
            <Mail01Icon className='h-4 w-4' />
          </a>
        </Button>
      </div>
    )
  }

  if (variant === 'links') {
    return (
      <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
        <a
          href={SUPPORT_CONTACTS.telegram.url}
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-foreground transition-colors'
        >
          {t('support.telegram')}
        </a>
        <a href={SUPPORT_CONTACTS.email.url} className='hover:text-foreground transition-colors'>
          {t('support.email')}
        </a>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Button variant='outline' className='justify-start' asChild>
        <a href={SUPPORT_CONTACTS.telegram.url} target='_blank' rel='noopener noreferrer'>
          <Send01Icon className='mr-2 h-4 w-4' />
          {t('support.telegram')}
        </a>
      </Button>
      <Button variant='outline' className='justify-start' asChild>
        <a href={SUPPORT_CONTACTS.email.url}>
          <Mail01Icon className='mr-2 h-4 w-4' />
          {t('support.email')}
        </a>
      </Button>
    </div>
  )
}
