import { useTranslation } from 'react-i18next'
import { LegalLayout } from '@/shared/ui/legal-layout'

export function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <LegalLayout pageType="privacy">
      <h1>{t('legal.privacy.title')}</h1>
      <p className="lead">{t('legal.privacy.description')}</p>

      <p className="text-sm text-muted-foreground">
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </p>

      <h2>1. {t('legal.privacy.sections.collection.title')}</h2>
      <p>{t('legal.privacy.sections.collection.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.collection.items', { returnObjects: true }) as string[]).map(
          (item) => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <h2>2. {t('legal.privacy.sections.usage.title')}</h2>
      <p>{t('legal.privacy.sections.usage.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.usage.items', { returnObjects: true }) as string[]).map(
          (item) => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <h2>3. {t('legal.privacy.sections.sharing.title')}</h2>
      <p>{t('legal.privacy.sections.sharing.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.sharing.items', { returnObjects: true }) as string[]).map(
          (item) => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <h2>4. {t('legal.privacy.sections.security.title')}</h2>
      <p>{t('legal.privacy.sections.security.content')}</p>

      <h2>5. {t('legal.privacy.sections.retention.title')}</h2>
      <p>{t('legal.privacy.sections.retention.content')}</p>

      <h2>6. {t('legal.privacy.sections.rights.title')}</h2>
      <p>{t('legal.privacy.sections.rights.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.rights.items', { returnObjects: true }) as string[]).map(
          (item) => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <h2>7. {t('legal.privacy.sections.cookies.title')}</h2>
      <p>
        {t('legal.privacy.sections.cookies.content').split('Cookie Policy')[0]}
        <a href="/legal/cookies">{t('legal.cookies.title')}</a>
        {t('legal.privacy.sections.cookies.content').includes('for more information') ? ' for more information.' : '.'}
      </p>

      <h2>8. {t('legal.privacy.sections.children.title')}</h2>
      <p>{t('legal.privacy.sections.children.content')}</p>

      <h2>9. {t('legal.privacy.sections.changes.title')}</h2>
      <p>{t('legal.privacy.sections.changes.content')}</p>

      <h2>10. {t('legal.privacy.sections.contact.title')}</h2>
      <p>
        {t('legal.privacy.sections.contact.content')}{' '}
        <a href="mailto:privacy@arbor.com">privacy@arbor.com</a>.
      </p>
    </LegalLayout>
  )
}
