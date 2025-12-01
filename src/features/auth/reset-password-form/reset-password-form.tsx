import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useActionData, useNavigation, useSubmit } from 'react-router'
import { z } from 'zod'
import { AUTH_ROUTES } from '@/shared/config'
import { Button } from '@/shared/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/form'
import { Input } from '@/shared/components/input'

export const ResetPasswordForm = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const actionData = useActionData<{ success?: boolean }>()
  const submit = useSubmit()

  const isLoading = navigation.state === 'submitting'
  const isSuccess = actionData?.success

  // Schema inside component for i18n
  const resetPasswordSchema = z.object({
    email: z.string().email(t('validation.email'))
  })

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  if (isSuccess) {
    return (
      <div className='text-center space-y-4 flex flex-col items-center'>
        <div className='h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4'>
          <MailCheck className='h-8 w-8 text-green-600 dark:text-green-400' />
        </div>
        <h3 className='text-xl font-semibold'>{t('auth.resetPassword.checkEmailTitle')}</h3>
        <Button variant='outline' className='w-full' asChild>
          <a href={AUTH_ROUTES.signIn}>{t('auth.resetPassword.backToSignIn')}</a>
        </Button>
      </div>
    )
  }

  return (
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
              <FormLabel>{t('auth.resetPassword.emailLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.signIn.emailPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {t('auth.resetPassword.submitButton')}
        </Button>
      </form>
    </Form>
  )
}
