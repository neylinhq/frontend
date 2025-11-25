import { Link } from 'react-router'
import { SignUpForm } from '@/features/auth/sign-up-form'
import { AuthLayout } from '@/shared/ui/auth-layout'

export const SignUpPage = () => {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Создать аккаунт</h1>
          <p className="text-sm text-muted-foreground">
            Введите email для создания новой учетной записи
          </p>
        </div>

        <SignUpForm />

        <div className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link to="/auth/sign-in" className="underline underline-offset-4 hover:text-primary">
            Войти
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
