import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SignUpForm } from '@/features/auth/sign-up-form'
import { AUTH_ROUTES } from '@/shared/config'

export const SignUpPage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center text-balance">
        <h1 className="text-2xl font-semibold tracking-tight">{t('auth.signUp.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.signUp.description')}</p>
      </div>

      <SignUpForm />

      <div className="text-center text-sm text-muted-foreground">
        {t('auth.signUp.hasAccount')}{' '}
        <Link
          to={AUTH_ROUTES.signIn}
          className="underline underline-offset-4 hover:text-primary"
          prefetch="intent"
        >
          {t('auth.signUp.signInLink')}
        </Link>
      </div>
    </div>
  )
}
