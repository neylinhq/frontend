import { useTranslation } from 'react-i18next'
import { LegalLayout } from '@/shared/components/legal-layout'
import { Typography } from '@/shared/components/typography'

export const LicensePage = () => {
  const { t } = useTranslation()

  return (
    <LegalLayout>
      <Typography className='mb-4' variant='h1'>
        {t('legal.license.title')}
      </Typography>
      <Typography variant='lead' className='mb-8'>
        {t('legal.license.description')}
      </Typography>

      <Typography variant='muted' className='mb-8'>
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant='h2'>{t('legal.license.sections.mit.title')}</Typography>

      <Typography variant='muted'>
        {t('legal.license.sections.mit.copyright', { year: new Date().getFullYear() })}
      </Typography>

      <p>{t('legal.license.sections.mit.permission')}</p>

      <p>{t('legal.license.sections.mit.notice')}</p>

      <p className='font-semibold uppercase text-sm'>{t('legal.license.sections.mit.warranty')}</p>

      <Typography variant='h2'>{t('legal.license.sections.thirdParty.title')}</Typography>
      <p>{t('legal.license.sections.thirdParty.intro')}</p>

      <Typography variant='h3'>React</Typography>
      <p>
        {t('legal.license.sections.thirdParty.react')}
        <br />
        <a
          href='https://github.com/facebook/react/blob/main/LICENSE'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('legal.license.sections.thirdParty.viewLicense')}
        </a>
      </p>

      <Typography variant='h3'>React Router</Typography>
      <p>
        {t('legal.license.sections.thirdParty.reactRouter')}
        <br />
        <a
          href='https://github.com/remix-run/react-router/blob/main/LICENSE.md'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('legal.license.sections.thirdParty.viewLicense')}
        </a>
      </p>

      <Typography variant='h3'>TanStack Query</Typography>
      <p>
        {t('legal.license.sections.thirdParty.tanstack')}
        <br />
        <a
          href='https://github.com/TanStack/query/blob/main/LICENSE'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('legal.license.sections.thirdParty.viewLicense')}
        </a>
      </p>

      <Typography variant='h3'>ReactFlow</Typography>
      <p>
        {t('legal.license.sections.thirdParty.reactflow')}
        <br />
        <a
          href='https://github.com/xyflow/xyflow/blob/main/LICENSE'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('legal.license.sections.thirdParty.viewLicense')}
        </a>
      </p>

      <Typography variant='h3'>Tailwind CSS</Typography>
      <p>
        {t('legal.license.sections.thirdParty.tailwind')}
        <br />
        <a
          href='https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('legal.license.sections.thirdParty.viewLicense')}
        </a>
      </p>

      <Typography variant='h3'>Lucide Icons</Typography>
      <p>
        {t('legal.license.sections.thirdParty.lucide')}
        <br />
        <a
          href='https://github.com/lucide-icons/lucide/blob/main/LICENSE'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('legal.license.sections.thirdParty.viewLicense')}
        </a>
      </p>

      <Typography variant='h2'>{t('legal.license.sections.attribution.title')}</Typography>
      <p>{t('legal.license.sections.attribution.content')}</p>

      <Typography variant='h2'>{t('legal.license.sections.contact.title')}</Typography>
      <p>
        {t('legal.license.sections.contact.content')}{' '}
        <a href='mailto:legal@neylin.com'>legal@neylin.com</a>.
      </p>
    </LegalLayout>
  )
}
