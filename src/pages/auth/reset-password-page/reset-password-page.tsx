import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'

export const ResetPasswordPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('auth.resetPassword.title')}</h1>
        <p className="text-sm text-muted-foreground text-balance">
          {t('auth.resetPassword.description')}
        </p>
      </div>

      <ResetPasswordForm />

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {t('auth.resetPassword.rememberPassword')}{' '}
        <Link to="/auth/sign-in" className="underline hover:text-primary" prefetch="intent">
          {t('auth.resetPassword.signInLink')}
        </Link>
      </div>
    </div>
  )
}
