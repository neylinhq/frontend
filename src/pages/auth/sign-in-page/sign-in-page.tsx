import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SignInForm } from '@/features/auth/sign-in-form'
import { AUTH_ROUTES } from '@/shared/config'
import { Typography } from '@/shared/ui/typography'

export const SignInPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center text-balance">
        <Typography variant="h1">{t('auth.signIn.title')}</Typography>
        <p className="text-sm text-muted-foreground">{t('auth.signIn.description')}</p>
      </div>

      <SignInForm />

      <div className="text-center text-sm text-muted-foreground">
        {t('auth.signIn.noAccount')}{' '}
        <Link
          to={AUTH_ROUTES.signUp}
          className="underline underline-offset-4 hover:text-primary"
          prefetch="intent"
        >
          {t('auth.signIn.signUpLink')}
        </Link>
      </div>
    </div>
  )
}
