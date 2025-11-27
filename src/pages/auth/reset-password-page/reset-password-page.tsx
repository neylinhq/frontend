import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'
import { AUTH_ROUTES } from '@/shared/config'
import { Typography } from '@/shared/ui/typography'

export const ResetPasswordPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <Typography variant="h1">{t('auth.resetPassword.title')}</Typography>
        <p className="text-sm text-muted-foreground text-balance">
          {t('auth.resetPassword.description')}
        </p>
      </div>

      <ResetPasswordForm />

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {t('auth.resetPassword.rememberPassword')}{' '}
        <Link to={AUTH_ROUTES.signIn} className="underline hover:text-primary" prefetch="intent">
          {t('auth.resetPassword.signInLink')}
        </Link>
      </div>
    </div>
  )
}
