import { useTranslation } from 'react-i18next'
import { LegalLayout } from '@/shared/ui/legal-layout'

export const LicensePage = () => {
  const { t } = useTranslation()

  return (
    <LegalLayout>
      <h1>{t('legal.license.title')}</h1>
      <p className='lead'>{t('legal.license.description')}</p>

      <p className='text-sm text-muted-foreground'>
        {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
      </p>

      <h2>{t('legal.license.sections.mit.title')}</h2>

      <p className='text-sm text-muted-foreground'>
        {t('legal.license.sections.mit.copyright', { year: new Date().getFullYear() })}
      </p>

      <p>{t('legal.license.sections.mit.permission')}</p>

      <p>{t('legal.license.sections.mit.notice')}</p>

      <p className='font-semibold uppercase text-sm'>{t('legal.license.sections.mit.warranty')}</p>

      <h2>{t('legal.license.sections.thirdParty.title')}</h2>
      <p>{t('legal.license.sections.thirdParty.intro')}</p>

      <h3>React</h3>
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

      <h3>React Router</h3>
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

      <h3>TanStack Query</h3>
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

      <h3>ReactFlow</h3>
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

      <h3>Tailwind CSS</h3>
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

      <h3>Lucide Icons</h3>
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

      <h2>{t('legal.license.sections.attribution.title')}</h2>
      <p>{t('legal.license.sections.attribution.content')}</p>

      <h2>{t('legal.license.sections.contact.title')}</h2>
      <p>
        {t('legal.license.sections.contact.content')}{' '}
        <a href='mailto:legal@arbor.com'>legal@arbor.com</a>.
      </p>
    </LegalLayout>
  )
}
