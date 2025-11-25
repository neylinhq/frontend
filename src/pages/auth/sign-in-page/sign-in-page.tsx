import { Link } from 'react-router'
import { SignInForm } from '@/features/auth/sign-in-form'
import { AuthLayout } from '@/shared/ui/auth-layout'

export const SignInPage = () => {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Вход в аккаунт</h1>
          <p className="text-sm text-muted-foreground">Введите ваш email для входа в систему</p>
        </div>

        <SignInForm />

        <div className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link to="/auth/sign-up" className="underline underline-offset-4 hover:text-primary">
            Регистрация
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
