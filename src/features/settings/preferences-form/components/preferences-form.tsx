import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
import { type User, type UserPreferences, defaultUserPreferences, useUpdatePreferences } from '@/entities/user'

interface PreferencesFormProps {
  user: User
}

export function PreferencesForm({ user }: PreferencesFormProps) {
  const { t } = useTranslation()
  const updatePreferences = useUpdatePreferences()

  const preferences = user.preferences || defaultUserPreferences

  const handleChange = <K extends keyof UserPreferences>(
    section: K,
    field: keyof UserPreferences[K],
    value: UserPreferences[K][keyof UserPreferences[K]]
  ) => {
    const newPreferences: UserPreferences = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [field]: value,
      },
    }

    updatePreferences.mutate(newPreferences, {
      onSuccess: () => {
        toast.success(t('common.saved'))
      },
      onError: () => {
        toast.error(t('errors.failedSave'))
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('settings.preferences.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('settings.preferences.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences.notifications.title')}</CardTitle>
          <CardDescription>{t('settings.preferences.notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">
                {t('settings.preferences.notifications.email')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.notifications.emailDescription')}
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.notifications.email}
              onCheckedChange={(checked) => handleChange('notifications', 'email', checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">{t('settings.preferences.notifications.marketing')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.notifications.marketingDescription')}
              </p>
            </div>
            <Switch
              id="marketing"
              checked={preferences.notifications.marketing}
              onCheckedChange={(checked) => handleChange('notifications', 'marketing', checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="updates">{t('settings.preferences.notifications.updates')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.notifications.updatesDescription')}
              </p>
            </div>
            <Switch
              id="updates"
              checked={preferences.notifications.updates}
              onCheckedChange={(checked) => handleChange('notifications', 'updates', checked)}
              disabled={updatePreferences.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences.interface.title')}</CardTitle>
          <CardDescription>{t('settings.preferences.interface.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.preferences.interface.density')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.interface.densityDescription')}
              </p>
            </div>
            <Select
              value={preferences.interface.density}
              onValueChange={(value) =>
                handleChange('interface', 'density', value as 'compact' | 'comfortable' | 'spacious')
              }
              disabled={updatePreferences.isPending}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">
                  {t('settings.preferences.interface.densityCompact')}
                </SelectItem>
                <SelectItem value="comfortable">
                  {t('settings.preferences.interface.densityComfortable')}
                </SelectItem>
                <SelectItem value="spacious">
                  {t('settings.preferences.interface.densitySpacious')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">{t('settings.preferences.interface.animations')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.interface.animationsDescription')}
              </p>
            </div>
            <Switch
              id="animations"
              checked={preferences.interface.animations}
              onCheckedChange={(checked) => handleChange('interface', 'animations', checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">{t('settings.preferences.interface.sound')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.interface.soundDescription')}
              </p>
            </div>
            <Switch
              id="sound"
              checked={preferences.interface.sound}
              onCheckedChange={(checked) => handleChange('interface', 'sound', checked)}
              disabled={updatePreferences.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
