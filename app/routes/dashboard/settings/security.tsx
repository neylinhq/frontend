import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import {
  EmailChangeForm,
  PasswordChangeForm,
  DeleteAccountSection,
  ActiveSessions,
} from '@/features/settings'
import type { SettingsContext } from './layout'

export default function SecurityPage() {
  const { t } = useTranslation()
  const { user } = useOutletContext<SettingsContext>()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('settings.security.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.security.description')}</p>
      </div>

      <EmailChangeForm currentEmail={user.email} />
      <PasswordChangeForm />
      <ActiveSessions />
      <DeleteAccountSection />
    </div>
  )
}
