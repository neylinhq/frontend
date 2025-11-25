import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SignInForm } from '@/features/auth/sign-in-form'
import { AuthLayout } from '@/shared/ui/auth-layout'

export const SignInPage = () => {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('auth.signIn.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.signIn.description')}</p>
        </div>

        <SignInForm />

        <div className="text-center text-sm text-muted-foreground">
          {t('auth.signIn.noAccount')}{' '}
          <Link
            to="/auth/sign-up"
            className="underline underline-offset-4 hover:text-primary"
            prefetch="intent" // Загружаем код страницы при наведении
          >
            {t('auth.signIn.signUpLink')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
