import { Link } from 'react-router'
import { SignUpForm } from '@/features/auth/sign-up-form'
import { AuthLayout } from '@/shared/ui/auth-layout'

export const SignUpPage = () => {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>

        <SignUpForm />

        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/auth/sign-in" className="underline hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
