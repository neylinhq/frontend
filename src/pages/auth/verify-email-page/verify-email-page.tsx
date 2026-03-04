import { useTranslation } from 'react-i18next'
import { Link, useLoaderData } from 'react-router'

import { VerifyEmailForm } from '@/features/auth/verify-email-form'
import { AUTH_ROUTES } from '@/shared/config'

interface LoaderData {
  email?: string
}

export const VerifyEmailPage = () => {
  const { t } = useTranslation()
  const { email } = useLoaderData<LoaderData>()

  return (
    <div className='space-y-6'>
      <VerifyEmailForm email={email} />

      <div className='text-center text-sm text-muted-foreground'>
        {t('auth.verifyEmail.wrongEmail')}{' '}
        <Link
          to={AUTH_ROUTES.signUp}
          className='underline underline-offset-4 hover:text-primary'
          prefetch='intent'
        >
          {t('auth.verifyEmail.signUpAgain')}
        </Link>
      </div>
    </div>
  )
}
