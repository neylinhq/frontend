import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRegisterMutation } from '@/entities/session'
import { Button } from '@/shared/ui/button'
import { FormDivider } from '@/shared/ui/form-divider'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const signUpSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email(),
  password: z.string().min(6, 'Min 6 chars')
})

type SignUpValues = z.infer<typeof signUpSchema>

export const SignUpForm = () => {
  const registerMutation = useRegisterMutation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema)
  })

  const onSubmit = (data: SignUpValues) => {
    registerMutation.mutate(data)
  }

  const isSubmitting = registerMutation.isPending

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="Max" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Robinson" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>
      <FormDivider>Or continue with</FormDivider>
      <Button variant="outline" type="button" disabled={isSubmitting} className="w-full">
        Sign up with Google
      </Button>
    </div>
  )
}
