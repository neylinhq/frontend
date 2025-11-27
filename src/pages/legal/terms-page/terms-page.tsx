import { useTranslation } from 'react-i18next'
import { LegalLayout } from '@/shared/ui/legal-layout'
import { Typography } from '@/shared/ui/typography'

export function TermsPage() {
  const { t } = useTranslation()

  return (
    <LegalLayout>
      <Typography variant="h1">{t('legal.terms.title')}</Typography>
      <Typography variant="lead" className="mb-8">{t('legal.terms.description')}</Typography>

      <Typography variant="muted" className="mb-8">
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant="h2">1. {t('legal.terms.sections.acceptance.title')}</Typography>
      <p>{t('legal.terms.sections.acceptance.content')}</p>

      <Typography variant="h2">2. {t('legal.terms.sections.license.title')}</Typography>
      <p>{t('legal.terms.sections.license.intro')}</p>
      <ul>
        {(t('legal.terms.sections.license.items', { returnObjects: true }) as string[]).map(
          (item) => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <Typography variant="h2">3. {t('legal.terms.sections.disclaimer.title')}</Typography>
      <p>{t('legal.terms.sections.disclaimer.content')}</p>

      <Typography variant="h2">4. {t('legal.terms.sections.limitations.title')}</Typography>
      <p>{t('legal.terms.sections.limitations.content')}</p>

      <Typography variant="h2">5. {t('legal.terms.sections.accuracy.title')}</Typography>
      <p>{t('legal.terms.sections.accuracy.content')}</p>

      <Typography variant="h2">6. {t('legal.terms.sections.link.title')}</Typography>
      <p>{t('legal.terms.sections.links.content')}</p>

      <Typography variant="h2">7. {t('legal.terms.sections.modifications.title')}</Typography>
      <p>{t('legal.terms.sections.modifications.content')}</p>

      <Typography variant="h2">8. {t('legal.terms.sections.governingLaw.title')}</Typography>
      <p>{t('legal.terms.sections.governingLaw.content')}</p>

      <Typography variant="h2">9. {t('legal.terms.sections.contact.title')}</Typography>
      <p>
        {t('legal.terms.sections.contact.content')}{' '}
        <a href="mailto:legal@arbor.com">legal@arbor.com</a>.
      </p>
    </LegalLayout>
  )
}
