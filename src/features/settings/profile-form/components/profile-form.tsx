import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { type User, useUpdateProfile, useUploadAvatar } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Typography } from '@/shared/ui/typography'
import { type ProfileFormValues, profileFormSchema } from '../lib/validation'
import { AvatarUpload } from './avatar-upload'

interface ProfileFormProps {
  user: User
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const { t } = useTranslation()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user.displayName || '',
      username: user.username || '',
      bio: user.bio || ''
    }
  })

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values, {
      onSuccess: () => {
        toast.success(t('common.saved'))
      },
      onError: () => {
        toast.error(t('errors.failedSave'))
      }
    })
  }

  const handleAvatarUpload = (file: File) => {
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        toast.success(t('settings.profile.avatar.uploaded'))
      },
      onError: () => {
        toast.error(t('errors.failedUpload'))
      }
    })
  }

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h2'>{t('settings.profile.title')}</Typography>
        <p className='text-sm text-muted-foreground mt-1'>{t('settings.profile.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.avatar.title')}</CardTitle>
          <CardDescription>{t('settings.profile.avatar.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentUrl={user.avatarUrl}
            fallback={
              user.displayName?.slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase()
            }
            onUpload={handleAvatarUpload}
            isPending={uploadAvatar.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.personal.title')}</CardTitle>
          <CardDescription>{t('settings.profile.personal.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='displayName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.profile.personal.displayName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.placeholders.name')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('settings.profile.personal.displayNameHint')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.profile.personal.username')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.placeholders.username')} {...field} />
                    </FormControl>
                    <FormDescription>{t('settings.profile.personal.usernameHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bio'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.profile.personal.bio')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('settings.profile.personal.bioPlaceholder')}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('settings.profile.personal.bioHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => form.reset()}
                  disabled={!form.formState.isDirty}
                >
                  {t('common.cancel')}
                </Button>
                <Button type='submit' disabled={updateProfile.isPending || !form.formState.isDirty}>
                  {updateProfile.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
