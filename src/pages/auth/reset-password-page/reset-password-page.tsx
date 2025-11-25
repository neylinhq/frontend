import { Link } from 'react-router'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'
import { AuthLayout } from '@/shared/ui/auth-layout'

export const ResetPasswordPage = () => {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-muted-foreground text-balance">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>

        <ResetPasswordForm />

        <div className="mt-4 text-center text-sm">
          Remember your password?{' '}
          <Link to="/auth/sign-in" className="underline hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
