import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { sessionApi } from '@/entities/session'
import { ApiError } from '@/shared/api/client'
import { toast } from '@/shared/components/toast'
import { z } from 'zod'
import { Button } from '@/shared/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/form'
import { FormDivider } from '@/shared/components/form-divider'
import { Input } from '@/shared/components/input'
import { LegalLinks } from '@/shared/components/legal-links'

export const SignUpForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // Define schema inside component to use t()
  const signUpSchema = z
    .object({
      email: z.string().email(t('validation.email')),
      password: z.string().min(8, t('validation.passwordMin', { min: 8 })),
      confirmPassword: z.string().min(1, t('validation.required'))
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword']
    })

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  return (
    <div className='grid gap-6'>
      <Form {...form}>
        <form
          className='grid gap-4'
          onSubmit={form.handleSubmit(async data => {
            setIsLoading(true)
            try {
              const user = await sessionApi.register({
                email: data.email,
                password: data.password
              })
              // Redirect to verify-email with email param
              navigate(`/auth/verify-email?email=${encodeURIComponent(user.email)}`)
            } catch (error) {
              if (error instanceof ApiError) {
                const errorData = error.data as { error?: { message?: string } } | null
                toast.error(t('auth.signUp.error'), {
                  description: errorData?.error?.message || t('auth.signUp.genericError')
                })
              } else {
                toast.error(t('auth.signUp.error'), {
                  description: t('auth.signUp.genericError')
                })
              }
            } finally {
              setIsLoading(false)
            }
          })}
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.signUp.emailLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.signIn.emailPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.signUp.passwordLabel')}</FormLabel>
                <FormControl>
                  <Input type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.signUp.confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('auth.signUp.submitButton')}
          </Button>

          <p className='text-xs text-center text-muted-foreground text-balance'>
            {t('auth.signUp.consent')} <LegalLinks variant='embedded' />
          </p>

          <FormDivider>{t('auth.signIn.orDivider')}</FormDivider>

          <Button variant='outline' className='w-full' type='button'>
            {t('auth.signIn.githubButton')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
