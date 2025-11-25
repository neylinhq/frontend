import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'

import { useLoginMutation } from '@/entities/session'
import { Button } from '@/shared/ui/button'
import { FormDivider } from '@/shared/ui/form-divider'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type SignInValues = z.infer<typeof signInSchema>

export const SignInForm = () => {
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema)
  })

  const onSubmit = (data: SignInValues) => {
    loginMutation.mutate(data)
  }

  const isSubmitting = loginMutation.isPending

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
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
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </form>

      <FormDivider>Or continue with</FormDivider>

      <Button variant="outline" type="button" disabled={isSubmitting} className="w-full">
        Google
      </Button>
    </div>
  )
}
