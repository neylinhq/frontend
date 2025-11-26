import { useTranslation } from 'react-i18next'
import { LegalLayout } from '@/shared/ui/legal-layout'

export function CookiesPage() {
  const { t } = useTranslation()

  return (
    <LegalLayout>
      <h1>{t('legal.cookies.title')}</h1>
      <p className="lead">{t('legal.cookies.description')}</p>

      <p className="text-sm text-muted-foreground">
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </p>

      <h2>1. {t('legal.cookies.sections.what.title')}</h2>
      <p>{t('legal.cookies.sections.what.content')}</p>

      <h2>2. {t('legal.cookies.sections.how.title')}</h2>
      <p>{t('legal.cookies.sections.how.intro')}</p>
      <ul>
        <li>
          <strong>{t('legal.cookies.sections.how.essential.title')}:</strong>{' '}
          {t('legal.cookies.sections.how.essential.description')}
        </li>
        <li>
          <strong>{t('legal.cookies.sections.how.preference.title')}:</strong>{' '}
          {t('legal.cookies.sections.how.preference.description')}
        </li>
        <li>
          <strong>{t('legal.cookies.sections.how.analytics.title')}:</strong>{' '}
          {t('legal.cookies.sections.how.analytics.description')}
        </li>
        <li>
          <strong>{t('legal.cookies.sections.how.performance.title')}:</strong>{' '}
          {t('legal.cookies.sections.how.performance.description')}
        </li>
      </ul>

      <h2>3. {t('legal.cookies.sections.types.title')}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>{t('legal.cookies.sections.types.table.name')}</th>
              <th>{t('legal.cookies.sections.types.table.purpose')}</th>
              <th>{t('legal.cookies.sections.types.table.duration')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>{t('legal.cookies.sections.types.table.language.name')}</code>
              </td>
              <td>{t('legal.cookies.sections.types.table.language.purpose')}</td>
              <td>{t('legal.cookies.sections.types.table.language.duration')}</td>
            </tr>
            <tr>
              <td>
                <code>{t('legal.cookies.sections.types.table.theme.name')}</code>
              </td>
              <td>{t('legal.cookies.sections.types.table.theme.purpose')}</td>
              <td>{t('legal.cookies.sections.types.table.theme.duration')}</td>
            </tr>
            <tr>
              <td>
                <code>{t('legal.cookies.sections.types.table.auth.name')}</code>
              </td>
              <td>{t('legal.cookies.sections.types.table.auth.purpose')}</td>
              <td>{t('legal.cookies.sections.types.table.auth.duration')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. {t('legal.cookies.sections.thirdParty.title')}</h2>
      <p>{t('legal.cookies.sections.thirdParty.content')}</p>

      <h2>5. {t('legal.cookies.sections.managing.title')}</h2>
      <p>{t('legal.cookies.sections.managing.intro')}</p>

      <h3>{t('legal.cookies.sections.managing.subtitle')}</h3>
      <ul>
        <li>
          <strong>Chrome:</strong> {t('legal.cookies.sections.managing.browsers.chrome')}
        </li>
        <li>
          <strong>Firefox:</strong> {t('legal.cookies.sections.managing.browsers.firefox')}
        </li>
        <li>
          <strong>Safari:</strong> {t('legal.cookies.sections.managing.browsers.safari')}
        </li>
        <li>
          <strong>Edge:</strong> {t('legal.cookies.sections.managing.browsers.edge')}
        </li>
      </ul>

      <h2>6. {t('legal.cookies.sections.dnt.title')}</h2>
      <p>{t('legal.cookies.sections.dnt.content')}</p>

      <h2>7. {t('legal.cookies.sections.updates.title')}</h2>
      <p>{t('legal.cookies.sections.updates.content')}</p>

      <h2>8. {t('legal.cookies.sections.contact.title')}</h2>
      <p>
        {t('legal.cookies.sections.contact.content')}{' '}
        <a href="mailto:privacy@arbor.com">privacy@arbor.com</a>.
      </p>
    </LegalLayout>
  )
}
