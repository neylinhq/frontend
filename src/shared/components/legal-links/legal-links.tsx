import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '@/shared/lib/cn'

import {
  DEFAULT_LINKS_BY_VARIANT,
  LEGAL_LINKS,
  type LegalLinkVariant
} from './legal-links.constants'

interface LegalLinksProps {
  variant?: LegalLinkVariant
  links?: Array<'terms' | 'privacy' | 'cookies' | 'license'>
  className?: string
  separator?: boolean
}

export const LegalLinks = ({
  variant = 'footer',
  links,
  className,
  separator = variant === 'inline'
}: LegalLinksProps) => {
  const { t } = useTranslation()

  const linkKeys = links || DEFAULT_LINKS_BY_VARIANT[variant]

  const variantClasses: Record<LegalLinkVariant, string> = {
    footer: 'flex gap-6 text-sm text-muted-foreground',
    inline: 'flex flex-wrap justify-center gap-3 text-xs text-muted-foreground',
    embedded: 'inline',
    full: 'flex flex-wrap justify-center gap-4 text-sm text-primary'
  }

  const linkClasses: Record<LegalLinkVariant, string> = {
    footer: 'hover:text-foreground transition-colors',
    inline: 'hover:text-primary hover:underline',
    embedded: 'underline underline-offset-4 hover:text-primary',
    full: 'text-primary hover:underline'
  }

  const containerClass = cn(variantClasses[variant], className)
  const linkClass = linkClasses[variant]

  if (variant === 'embedded') {
    return (
      <>
        <Link to={LEGAL_LINKS.terms.href} className={linkClass}>
          {t(LEGAL_LINKS.terms.titleKey)}
        </Link>{' '}
        {t('auth.signUp.and')}{' '}
        <Link to={LEGAL_LINKS.privacy.href} className={linkClass}>
          {t(LEGAL_LINKS.privacy.titleKey)}
        </Link>
      </>
    )
  }

  return (
    <div className={containerClass}>
      {linkKeys.map((key, idx) => {
        const link = LEGAL_LINKS[key]
        return (
          <div key={key} className='flex items-center gap-3'>
            <Link to={link.href} className={linkClass}>
              {t(link.titleKey)}
            </Link>
            {separator && idx < linkKeys.length - 1 && <span>•</span>}
          </div>
        )
      })}
    </div>
  )
}
