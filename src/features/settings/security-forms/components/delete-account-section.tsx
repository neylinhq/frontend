import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useDeleteAccount } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { type DeleteAccountValues, deleteAccountSchema } from '../lib/validation'

export function DeleteAccountSection() {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const deleteAccount = useDeleteAccount()

  const form = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
      confirmation: ''
    }
  })

  const onSubmit = (values: DeleteAccountValues) => {
    deleteAccount.mutate(values.password, {
      onSuccess: () => {
        toast.success(t('settings.security.danger.deleted'))
        setIsDialogOpen(false)
        // In real app, redirect to home/logout
      },
      onError: error => {
        toast.error(error.message || t('errors.failedDelete'))
      }
    })
  }

  return (
    <>
      <Card className='border-destructive'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            <CardTitle className='text-destructive'>
              {t('settings.security.danger.title')}
            </CardTitle>
          </div>
          <CardDescription>{t('settings.security.danger.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='destructive' onClick={() => setIsDialogOpen(true)}>
            {t('settings.security.danger.deleteAccount')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.security.danger.confirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.security.danger.confirmDescription')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.security.danger.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.security.danger.typeDelete')}</FormLabel>
                    <FormControl>
                      <Input placeholder='DELETE' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant='outline' type='button' onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant='destructive' type='submit' disabled={deleteAccount.isPending}>
                  {deleteAccount.isPending
                    ? t('common.deleting')
                    : t('settings.security.danger.deleteAccount')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
