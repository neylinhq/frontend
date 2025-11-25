import { Link } from 'react-router'
import { SignInForm } from '@/features/auth/sign-in-form'
import { AuthLayout } from '@/shared/ui/auth-layout'

export const SignInPage = () => {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <SignInForm />

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/auth/sign-up" className="underline hover:text-primary">
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
