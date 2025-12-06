import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useActionData, useNavigation, useSubmit } from 'react-router'
import { toast } from 'sonner'
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

type ActionData = { error?: string; code?: string } | undefined

export const SignUpForm = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const submit = useSubmit()
  const actionData = useActionData<ActionData>()

  const isLoading = navigation.state === 'submitting'

  // Show toast on error from action
  useEffect(() => {
    if (actionData?.error) {
      toast.error(t('auth.signUp.error'), {
        description: actionData.error
      })
    }
  }, [actionData, t])

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
          onSubmit={form.handleSubmit(data => {
            submit(data, { method: 'post' })
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
