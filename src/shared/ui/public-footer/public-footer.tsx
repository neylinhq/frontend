import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { APP_NAME, CURRENT_YEAR } from '@/shared/config/app'

export function PublicFooter() {
  const { t } = useTranslation()

  return (
    <footer className="py-6 border-t">
      <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-sm text-muted-foreground">
        <span>
          © {CURRENT_YEAR} {APP_NAME}
        </span>
        <div className="flex gap-6">
          <Link to="/legal/terms" className="hover:text-foreground transition-colors">
            {t('legal.terms.title', 'Terms')}
          </Link>
          <Link to="/legal/privacy" className="hover:text-foreground transition-colors">
            {t('legal.privacy.title', 'Privacy')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
