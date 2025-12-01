import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import {
  ActiveSessions,
  DeleteAccountSection,
  EmailChangeForm,
  PasswordChangeForm
} from '@/features/settings'
import { Typography } from '@/shared/ui/typography'
import type { SettingsContext } from './layout'

const SecurityPage = () => {
  const { t } = useTranslation()
  const { user } = useOutletContext<SettingsContext>()

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h2'>{t('settings.security.title')}</Typography>
        <p className='text-sm text-muted-foreground mt-1'>{t('settings.security.description')}</p>
      </div>

      <EmailChangeForm currentEmail={user.email} />
      <PasswordChangeForm />
      <ActiveSessions />
      <DeleteAccountSection />
    </div>
  )
}

export default SecurityPage
