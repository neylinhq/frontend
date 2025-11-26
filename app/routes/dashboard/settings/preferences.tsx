import { useTranslation } from 'react-i18next'
import { Label } from '@/shared/ui/label'
import { Field } from '@/shared/ui/field'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

export default function PreferencesPage() {
  const { t } = useTranslation()

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
            <Switch id="email-notifications" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">{t('settings.preferences.notifications.marketing')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.notifications.marketingDescription')}
              </p>
            </div>
            <Switch id="marketing" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="updates">{t('settings.preferences.notifications.updates')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.notifications.updatesDescription')}
              </p>
            </div>
            <Switch id="updates" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences.interface.title')}</CardTitle>
          <CardDescription>{t('settings.preferences.interface.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field label={t('settings.preferences.interface.density')}>
            <Select defaultValue="comfortable">
              <SelectTrigger>
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
          </Field>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">{t('settings.preferences.interface.animations')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.interface.animationsDescription')}
              </p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">{t('settings.preferences.interface.sound')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.preferences.interface.soundDescription')}
              </p>
            </div>
            <Switch id="sound" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
