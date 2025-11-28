import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useActionData, useNavigation, useSubmit } from 'react-router'
import { z } from 'zod'
import { AUTH_ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { FormDivider } from '@/shared/ui/form-divider'
import { Input } from '@/shared/ui/input'
import { LegalLinks } from '@/shared/ui/legal-links'

export function SignInForm() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const actionData = useActionData<{ error?: string }>()
  const submit = useSubmit()

  const isLoading = navigation.state === 'submitting'

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
          onSubmit={form.handleSubmit(data => {
            submit(data, { method: 'post' })
          })}
        >
          {actionData?.error && (
            <div className='text-sm font-medium text-destructive text-center'>
              {actionData.error}
            </div>
          )}

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

          <Button variant='outline' className='w-full' type='button'>
            {t('auth.signIn.githubButton')}
          </Button>
        </form>
      </Form>

      <LegalLinks variant='inline' separator />
    </div>
  )
}
