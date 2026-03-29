import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ResetPasswordForm } from '@/features/auth/reset-password-form'
import { Typography } from '@/shared/components/typography'
import { AUTH_ROUTES } from '@/shared/config'

export type Step = 'email' | 'code' | 'complete'

export const ResetPasswordPage = () => {
  const { t } = useTranslation()

  const [step, setStep] = useState<Step>('email')

  const description =
    step === 'email'
      ? t('auth.resetPassword.description')
      : step === 'code'
        ? t('auth.resetPassword.codeDescription')
        : t('auth.resetPassword.successDescription')

  return (
    <div className='space-y-6'>
      <div className='flex flex-col space-y-2 text-center'>
        <Typography variant='h1'>{t('auth.resetPassword.title')}</Typography>
        {description && <p className='text-sm text-muted-foreground text-balance'>{description}</p>}
      </div>

      <ResetPasswordForm step={step} setStep={setStep} />

      {step !== 'complete' && (
        <div className='mt-4 text-center text-sm text-muted-foreground'>
          {t('auth.resetPassword.rememberPassword')}{' '}
          <Link to={AUTH_ROUTES.signIn} className='underline hover:text-primary' prefetch='intent'>
            {t('auth.resetPassword.signInLink')}
          </Link>
        </div>
      )}
    </div>
  )
}
