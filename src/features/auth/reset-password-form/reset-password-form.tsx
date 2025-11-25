import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'

import { useResetPasswordMutation } from '@/entities/session'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const resetSchema = z.object({
  email: z.string().email()
})

type ResetValues = z.infer<typeof resetSchema>

export const ResetPasswordForm = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const resetMutation = useResetPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema)
  })

  const onSubmit = (data: ResetValues) => {
    resetMutation.mutate(data.email, {
      onSuccess: () => setIsSuccess(true)
    })
  }

  const isSubmitting = resetMutation.isPending

  if (isSuccess) {
    return (
      <div className="grid gap-6 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We have sent a password reset link to your email address.
          </p>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link to="/auth/sign-in">Back to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </div>
      </form>
    </div>
  )
}
