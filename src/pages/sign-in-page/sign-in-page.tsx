import { Link } from 'react-router'
import { AuthLayout } from '@/shared/ui/auth-layout'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

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
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/auth/reset-password"
                className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </div>
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
