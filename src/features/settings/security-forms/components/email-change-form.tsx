import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from '@/shared/components/toast'
import { useChangeEmail } from '@/entities/user'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/form'
import { Input } from '@/shared/components/input'
import { type EmailChangeValues, emailChangeSchema } from '../lib/validation'

interface EmailChangeFormProps {
  currentEmail: string
}

export const EmailChangeForm = ({ currentEmail }: EmailChangeFormProps) => {
  const { t } = useTranslation()
  const changeEmail = useChangeEmail()

  const form = useForm<EmailChangeValues>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      newEmail: '',
      password: ''
    }
  })

  const onSubmit = (values: EmailChangeValues) => {
    changeEmail.mutate(values, {
      onSuccess: () => {
        toast.success(t('settings.security.email.success'))
        form.reset()
      },
      onError: error => {
        toast.error(error.message || t('errors.failedSave'))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.security.email.title')}</CardTitle>
        <CardDescription>{t('settings.security.email.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormItem>
              <FormLabel>{t('settings.security.email.current')}</FormLabel>
              <Input type='email' value={currentEmail} disabled />
            </FormItem>

            <FormField
              control={form.control}
              name='newEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.security.email.new')}</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder={t('form.placeholders.newEmail')} {...field} />
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
                  <FormLabel>{t('settings.security.email.confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder={t('form.placeholders.password')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                variant='outline'
                type='button'
                onClick={() => form.reset()}
                disabled={!form.formState.isDirty}
              >
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={changeEmail.isPending || !form.formState.isDirty}>
                {changeEmail.isPending ? t('common.saving') : t('settings.security.email.update')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
