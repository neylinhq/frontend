import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { FooterSection } from '../public-footer.constants'

interface FooterSectionProps {
  section: FooterSection
}

export const FooterSectionComponent = ({ section }: FooterSectionProps) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3'>
      <span className='text-sm font-semibold text-foreground'>{t(section.titleKey)}</span>
      <ul className='flex flex-col gap-2.5'>
        {section.links.map(link => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                {t(link.labelKey)}
              </a>
            ) : (
              <Link
                to={link.href}
                className='text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                {t(link.labelKey)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
