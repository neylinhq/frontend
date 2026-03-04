import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { APP_NAME, CURRENT_YEAR } from '@/shared/config/app'
import { LEGAL_ROUTES, ROUTES } from '@/shared/config/routes'

import { FooterSocial } from './footer-social'

export const PublicFooter = () => {
  const { t } = useTranslation()

  return (
    <footer className='bg-background mt-16'>
      <div className='max-w-5xl mx-auto px-4 md:px-6 py-5'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <span className='text-[11px] text-muted-foreground'>
            &copy; {CURRENT_YEAR} {APP_NAME}
          </span>

          <div className='flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground'>
            <FooterSocial />
            <span className='text-border'>|</span>
            <Link to={ROUTES.pricing} className='hover:text-foreground transition-colors'>
              {t('footer.links.pricing', 'Pricing').toLowerCase()}
            </Link>
            <Link to={LEGAL_ROUTES.terms} className='hover:text-foreground transition-colors'>
              {t('legal.terms.title', 'Terms').toLowerCase()}
            </Link>
            <Link to={LEGAL_ROUTES.privacy} className='hover:text-foreground transition-colors'>
              {t('legal.privacy.title', 'Privacy').toLowerCase()}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
