import { useTranslation } from 'react-i18next'

import { LegalLayout } from '@/shared/components/legal-layout'
import { Typography } from '@/shared/components/typography'

export const CookiesPage = () => {
  const { t } = useTranslation()

  return (
    <LegalLayout>
      <Typography className='mb-4' variant='h1'>
        {t('legal.cookies.title')}
      </Typography>
      <Typography variant='lead' className='mb-8'>
        {t('legal.cookies.description')}
      </Typography>

      <Typography variant='muted' className='mb-8'>
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant='h2'>1. {t('legal.cookies.sections.what.title')}</Typography>
      <p>{t('legal.cookies.sections.what.content')}</p>

      <Typography variant='h2'>2. {t('legal.cookies.sections.how.title')}</Typography>
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

      <Typography variant='h2'>3. {t('legal.cookies.sections.types.title')}</Typography>
      <div className='overflow-x-auto'>
        <table className='min-w-full'>
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

      <Typography variant='h2'>4. {t('legal.cookies.sections.thirdParty.title')}</Typography>
      <p>{t('legal.cookies.sections.thirdParty.content')}</p>

      <Typography variant='h2'>5. {t('legal.cookies.sections.managing.title')}</Typography>
      <p>{t('legal.cookies.sections.managing.intro')}</p>

      <Typography variant='h3'>{t('legal.cookies.sections.managing.subtitle')}</Typography>
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

      <Typography variant='h2'>6. {t('legal.cookies.sections.dnt.title')}</Typography>
      <p>{t('legal.cookies.sections.dnt.content')}</p>

      <Typography variant='h2'>7. {t('legal.cookies.sections.updates.title')}</Typography>
      <p>{t('legal.cookies.sections.updates.content')}</p>

      <Typography variant='h2'>8. {t('legal.cookies.sections.contact.title')}</Typography>
      <p>
        {t('legal.cookies.sections.contact.content')}{' '}
        <a href='mailto:privacy@neylin.com'>privacy@neylin.com</a>.
      </p>
    </LegalLayout>
  )
}
