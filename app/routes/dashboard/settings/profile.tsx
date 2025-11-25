import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function ProfilePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('settings.profile.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.profile.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.avatar.title')}</CardTitle>
          <CardDescription>{t('settings.profile.avatar.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt="Avatar" />
              <AvatarFallback className="text-lg">AB</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                {t('settings.profile.avatar.upload')}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t('settings.profile.avatar.requirements')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.personal.title')}</CardTitle>
          <CardDescription>{t('settings.profile.personal.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t('settings.profile.personal.displayName')}</Label>
            <Input id="displayName" placeholder="John Doe" />
            <p className="text-xs text-muted-foreground">
              {t('settings.profile.personal.displayNameHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t('settings.profile.personal.username')}</Label>
            <Input id="username" placeholder="johndoe" />
            <p className="text-xs text-muted-foreground">
              {t('settings.profile.personal.usernameHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('settings.profile.personal.bio')}</Label>
            <Textarea
              id="bio"
              placeholder={t('settings.profile.personal.bioPlaceholder')}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{t('settings.profile.personal.bioHint')}</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">{t('common.cancel')}</Button>
            <Button>{t('common.save')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
