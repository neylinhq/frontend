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
import { NOTIFICATION_SETTINGS, INTERFACE_SWITCH_SETTINGS, DENSITY_OPTIONS } from '../preferences-form.constants'

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
          {NOTIFICATION_SETTINGS.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={setting.id}>{t(setting.labelKey)}</Label>
                <p className="text-sm text-muted-foreground">
                  {t(setting.descriptionKey)}
                </p>
              </div>
              <Switch
                id={setting.id}
                checked={preferences.notifications[setting.field]}
                onCheckedChange={(checked) => handleChange('notifications', setting.field, checked)}
                disabled={updatePreferences.isPending}
              />
            </div>
          ))}
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
                {DENSITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {INTERFACE_SWITCH_SETTINGS.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={setting.id}>{t(setting.labelKey)}</Label>
                <p className="text-sm text-muted-foreground">
                  {t(setting.descriptionKey)}
                </p>
              </div>
              <Switch
                id={setting.id}
                checked={preferences.interface[setting.field]}
                onCheckedChange={(checked) => handleChange('interface', setting.field, checked)}
                disabled={updatePreferences.isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
