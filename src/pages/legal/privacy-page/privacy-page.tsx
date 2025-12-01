import { useTranslation } from 'react-i18next'
import { LEGAL_ROUTES } from '@/shared/config'
import { LegalLayout } from '@/shared/ui/legal-layout'
import { Typography } from '@/shared/ui/typography'

export const PrivacyPage = () => {
  const { t } = useTranslation()

  return (
    <LegalLayout>
      <Typography variant='h1'>{t('legal.privacy.title')}</Typography>
      <Typography variant='lead' className='mb-8'>
        {t('legal.privacy.description')}
      </Typography>

      <Typography variant='muted' className='mb-8'>
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant='h2'>1. {t('legal.privacy.sections.collection.title')}</Typography>
      <p>{t('legal.privacy.sections.collection.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.collection.items', { returnObjects: true }) as string[]).map(
          item => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <Typography variant='h2'>2. {t('legal.privacy.sections.usage.title')}</Typography>
      <p>{t('legal.privacy.sections.usage.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.usage.items', { returnObjects: true }) as string[]).map(
          item => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <Typography variant='h2'>3. {t('legal.privacy.sections.sharing.title')}</Typography>
      <p>{t('legal.privacy.sections.sharing.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.sharing.items', { returnObjects: true }) as string[]).map(
          item => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <Typography variant='h2'>4. {t('legal.privacy.sections.security.title')}</Typography>
      <p>{t('legal.privacy.sections.security.content')}</p>

      <Typography variant='h2'>5. {t('legal.privacy.sections.retention.title')}</Typography>
      <p>{t('legal.privacy.sections.retention.content')}</p>

      <Typography variant='h2'>6. {t('legal.privacy.sections.rights.title')}</Typography>
      <p>{t('legal.privacy.sections.rights.intro')}</p>
      <ul>
        {(t('legal.privacy.sections.rights.items', { returnObjects: true }) as string[]).map(
          item => (
            <li key={item}>{item}</li>
          )
        )}
      </ul>

      <Typography variant='h2'>7. {t('legal.privacy.sections.cookies.title')}</Typography>
      <p>
        {t('legal.privacy.sections.cookies.content').split('Cookie Policy')[0]}
        <a href={LEGAL_ROUTES.cookies}>{t('legal.cookies.title')}</a>
        {t('legal.privacy.sections.cookies.content').includes('for more information')
          ? ' for more information.'
          : '.'}
      </p>

      <Typography variant='h2'>8. {t('legal.privacy.sections.children.title')}</Typography>
      <p>{t('legal.privacy.sections.children.content')}</p>

      <Typography variant='h2'>9. {t('legal.privacy.sections.changes.title')}</Typography>
      <p>{t('legal.privacy.sections.changes.content')}</p>

      <Typography variant='h2'>10. {t('legal.privacy.sections.contact.title')}</Typography>
      <p>
        {t('legal.privacy.sections.contact.content')}{' '}
        <a href='mailto:privacy@arbor.com'>privacy@arbor.com</a>.
      </p>
    </LegalLayout>
  )
}
