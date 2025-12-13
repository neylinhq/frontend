import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router'
import { sessionApi, isTwoFactorRequired } from '@/entities/session'
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
import { githubIcon, Icon } from '@/shared/components/icon'
import { Input } from '@/shared/components/input'
import { LegalLinks } from '@/shared/components/legal-links'
import { AUTH_ROUTES } from '@/shared/config'
import { TelegramLoginButton } from '../telegram-login-button'

export const SignInForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  // Define schema inside component to access t()
  const signInSchema = z.object({
    email: z.string().email(t('validation.email')),
    password: z.string().min(6, t('validation.passwordMin', { min: 6 }))
  })

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
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
              const result = await sessionApi.login(data)

              // Check if 2FA is required
              if (isTwoFactorRequired(result)) {
                const returnUrl = searchParams.get('from') || '/dashboard/overview'
                // Navigate to 2FA page with challenge data
                navigate('/auth/two-factor', {
                  state: {
                    challengeToken: result.challengeToken,
                    twoFactorMethods: result.twoFactorMethods,
                    returnUrl
                  },
                  replace: true
                })
                return
              }

              // Normal login - clear cache and redirect
              queryClient.clear()
              const returnUrl = searchParams.get('from') || '/dashboard/overview'
              navigate(returnUrl)
            } catch (error) {
              if (error instanceof ApiError) {
                const errorData = error.data as { error?: { message?: string } } | null
                const message = errorData?.error?.message

                if (error.status === 401) {
                  toast.error(t('auth.signIn.error'), {
                    description: message || t('auth.signIn.invalidCredentials')
                  })
                } else {
                  toast.error(t('auth.signIn.error'), {
                    description: message || t('common.serverError')
                  })
                }
              } else {
                toast.error(t('auth.signIn.error'), {
                  description: t('common.serverError')
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
                <FormLabel>{t('auth.signIn.emailLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.signIn.emailPlaceholder')} type='email' {...field} />
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
                <div className='flex items-center'>
                  <FormLabel>{t('auth.signIn.passwordLabel')}</FormLabel>
                  <RouterLink
                    to={AUTH_ROUTES.resetPassword}
                    className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                    prefetch='intent'
                  >
                    {t('auth.signIn.forgotPassword')}
                  </RouterLink>
                </div>
                <FormControl>
                  <Input type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('auth.signIn.submitButton')}
          </Button>

          <FormDivider>{t('auth.signIn.orDivider')}</FormDivider>

          <div className='grid gap-2'>
            <Button variant='outline' className='w-full' type='button'>
              <Icon data={githubIcon} size={16} className='mr-2' />
              {t('auth.signIn.githubButton')}
            </Button>
            <TelegramLoginButton className='w-full' />
          </div>
        </form>
      </Form>

      <LegalLinks variant='inline' separator />
    </div>
  )
}
