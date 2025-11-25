import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Github, Slack, Chrome, Zap } from 'lucide-react'

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'settings.integrations.github.description',
    icon: Github,
    connected: false
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'settings.integrations.slack.description',
    icon: Slack,
    connected: false
  },
  {
    id: 'chrome',
    name: 'Chrome Extension',
    description: 'settings.integrations.chrome.description',
    icon: Chrome,
    connected: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'settings.integrations.zapier.description',
    icon: Zap,
    connected: false
  }
]

export default function IntegrationsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('settings.integrations.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('settings.integrations.description')}
        </p>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {t(integration.description)}
                      </CardDescription>
                    </div>
                  </div>
                  {integration.connected && (
                    <Badge variant="secondary">{t('settings.integrations.connected')}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                  {integration.connected
                    ? t('settings.integrations.disconnect')
                    : t('settings.integrations.connect')}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.integrations.api.title')}</CardTitle>
          <CardDescription>{t('settings.integrations.api.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t('settings.integrations.api.token')}</p>
              <p className="text-xs text-muted-foreground font-mono">••••••••••••••••</p>
            </div>
            <Button variant="outline" size="sm">
              {t('settings.integrations.api.regenerate')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t('settings.integrations.api.hint')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
