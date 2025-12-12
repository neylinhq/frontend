import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type ClientLoaderFunctionArgs, type LoaderFunctionArgs, useLoaderData, useOutletContext } from 'react-router'
import { twoFactorApi, twoFactorKeys } from '@/entities/two-factor'
import {
  ActiveSessions,
  DeleteAccountSection,
  EmailChangeForm,
  PasswordChangeForm,
  TwoFactorSection
} from '@/features/settings/security-forms'
import { getCookies } from '@/shared/api/server'
import { Typography } from '@/shared/components/typography'
import type { SettingsContext } from './layout'

// Server-side loader - prefetch 2FA status
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookies = getCookies(request)

  try {
    const twoFactorStatus = await twoFactorApi.getStatus({ cookies })
    return { twoFactorStatus }
  } catch {
    return { twoFactorStatus: null }
  }
}

// Client-side loader
export const clientLoader = async (_args: ClientLoaderFunctionArgs) => {
  try {
    const twoFactorStatus = await twoFactorApi.getStatus()
    return { twoFactorStatus }
  } catch {
    return { twoFactorStatus: null }
  }
}

clientLoader.hydrate = true

const SecurityPage = () => {
  const { t } = useTranslation()
  const { user } = useOutletContext<SettingsContext>()
  const { twoFactorStatus } = useLoaderData<typeof loader>()
  const queryClient = useQueryClient()

  // Seed React Query cache with SSR data
  useEffect(() => {
    if (twoFactorStatus) {
      queryClient.setQueryData(twoFactorKeys.status(), twoFactorStatus)
    }
  }, [twoFactorStatus, queryClient])

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h2'>{t('settings.security.title')}</Typography>
        <p className='text-sm text-muted-foreground mt-1'>{t('settings.security.description')}</p>
      </div>

      <TwoFactorSection />
      <EmailChangeForm currentEmail={user.email} />
      <PasswordChangeForm />
      <ActiveSessions />
      <DeleteAccountSection />
    </div>
  )
}

export default SecurityPage
