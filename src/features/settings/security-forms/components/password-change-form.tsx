import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useChangePassword } from '@/entities/user'
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
import { toast } from '@/shared/components/toast'

import { type PasswordChangeValues, passwordChangeSchema } from '../lib/validation'

export const PasswordChangeForm = () => {
  const { t } = useTranslation()
  const changePassword = useChangePassword()

  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = (values: PasswordChangeValues) => {
    changePassword.mutate(values, {
      onSuccess: () => {
        toast.success(t('settings.security.password.success'))
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
        <CardTitle>{t('settings.security.password.title')}</CardTitle>
        <CardDescription>{t('settings.security.password.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.security.password.current')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.security.password.new')}</FormLabel>
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
                  <FormLabel>{t('settings.security.password.confirm')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} />
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
              <Button type='submit' disabled={changePassword.isPending || !form.formState.isDirty}>
                {changePassword.isPending
                  ? t('common.saving')
                  : t('settings.security.password.update')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
