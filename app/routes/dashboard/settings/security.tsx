import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field } from '@/shared/ui/field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { AlertCircle, Laptop, Smartphone } from 'lucide-react'

const activeSessions = [
  {
    id: '1',
    device: 'Chrome on MacBook Pro',
    location: 'San Francisco, US',
    lastActive: '2 minutes ago',
    current: true,
    icon: Laptop
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'San Francisco, US',
    lastActive: '1 hour ago',
    current: false,
    icon: Smartphone
  }
]

export default function SecurityPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('settings.security.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.security.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.email.title')}</CardTitle>
          <CardDescription>{t('settings.security.email.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label={t('settings.security.email.current')}>
            <Input type="email" value="user@example.com" disabled />
          </Field>
          <Field label={t('settings.security.email.new')}>
            <Input type="email" placeholder="newemail@example.com" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline">{t('common.cancel')}</Button>
            <Button>{t('settings.security.email.update')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.password.title')}</CardTitle>
          <CardDescription>{t('settings.security.password.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label={t('settings.security.password.current')}>
            <Input type="password" />
          </Field>
          <Field label={t('settings.security.password.new')}>
            <Input type="password" />
          </Field>
          <Field label={t('settings.security.password.confirm')}>
            <Input type="password" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline">{t('common.cancel')}</Button>
            <Button>{t('settings.security.password.update')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.sessions.title')}</CardTitle>
          <CardDescription>{t('settings.security.sessions.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => {
            const Icon = session.icon

            return (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{session.device}</p>
                      {session.current && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {t('settings.security.sessions.current')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{session.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.security.sessions.lastActive')}: {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm">
                    {t('settings.security.sessions.revoke')}
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{t('settings.security.danger.title')}</CardTitle>
          </div>
          <CardDescription>{t('settings.security.danger.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">{t('settings.security.danger.deleteAccount')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
