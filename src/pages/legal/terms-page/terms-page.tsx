import { useTranslation } from 'react-i18next'
import { LegalLayout } from '@/shared/ui/legal-layout'

export function TermsPage() {
  const { t } = useTranslation()

  return (
    <LegalLayout>
      <h1>{t('legal.terms.title')}</h1>
      <p className="lead">{t('legal.terms.description')}</p>

      <p className="text-sm text-muted-foreground">
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </p>

      <h2>1. {t('legal.terms.sections.acceptance.title')}</h2>
      <p>{t('legal.terms.sections.acceptance.content')}</p>

      <h2>2. {t('legal.terms.sections.license.title')}</h2>
      <p>{t('legal.terms.sections.license.intro')}</p>
      <ul>
        {(t('legal.terms.sections.license.items', { returnObjects: true }) as string[]).map(
          (item) => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <h2>3. {t('legal.terms.sections.disclaimer.title')}</h2>
      <p>{t('legal.terms.sections.disclaimer.content')}</p>

      <h2>4. {t('legal.terms.sections.limitations.title')}</h2>
      <p>{t('legal.terms.sections.limitations.content')}</p>

      <h2>5. {t('legal.terms.sections.accuracy.title')}</h2>
      <p>{t('legal.terms.sections.accuracy.content')}</p>

      <h2>6. {t('legal.terms.sections.links.title')}</h2>
      <p>{t('legal.terms.sections.links.content')}</p>

      <h2>7. {t('legal.terms.sections.modifications.title')}</h2>
      <p>{t('legal.terms.sections.modifications.content')}</p>

      <h2>8. {t('legal.terms.sections.governingLaw.title')}</h2>
      <p>{t('legal.terms.sections.governingLaw.content')}</p>

      <h2>9. {t('legal.terms.sections.contact.title')}</h2>
      <p>
        {t('legal.terms.sections.contact.content')}{' '}
        <a href="mailto:legal@arbor.com">legal@arbor.com</a>.
      </p>
    </LegalLayout>
  )
}
