import { useTranslation } from 'react-i18next'
import { Typography } from '@/shared/ui/typography'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { BellRing, Check } from 'lucide-react'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/card'

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

export default function CardPage() {
  const { t } = useTranslation()

  const notifications = [
    {
      title: t('docs.card.notificationItems.newFeature'),
      description: t('docs.card.notificationItems.hoursAgo'),
    },
    {
      title: t('docs.card.notificationItems.systemUpdate'),
      description: t('docs.card.notificationItems.dayAgo'),
    },
    {
      title: t('docs.card.notificationItems.newComment'),
      description: t('docs.card.notificationItems.daysAgo'),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Typography variant="h1">Card</Typography>
        <Typography variant="lead">
          {t('docs.card.lead')}
        </Typography>
      </div>

      {/* Basic Example */}
      <section className="space-y-4">
        <div>
          <Typography variant="h2">{t('docs.card.basicExample.title')}</Typography>
          <Typography variant="muted">{t('docs.card.basicExample.description')}</Typography>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('docs.card.examples.title')}</CardTitle>
              <CardDescription>{t('docs.card.examples.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="p">
                {t('docs.card.examples.content')}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('docs.card.examples.withFooter')}</CardTitle>
              <CardDescription>{t('docs.card.examples.withFooterDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="p">{t('docs.card.examples.mainContent')}</Typography>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{t('docs.card.examples.cancel')}</Button>
              <Button>{t('docs.card.examples.save')}</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* With Notifications */}
      <section className="space-y-4 pt-4 border-t">
        <div>
          <Typography variant="h2">{t('docs.card.notifications.title')}</Typography>
          <Typography variant="muted">{t('docs.card.notifications.description')}</Typography>
        </div>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t('docs.card.notifications.cardTitle')}</CardTitle>
            <CardDescription>{t('docs.card.notifications.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <BellRing />
              <div className="flex-1 space-y-1">
                <Typography variant="small">{t('docs.card.notifications.pushTitle')}</Typography>
                <Typography variant="muted">{t('docs.card.notifications.pushDescription')}</Typography>
              </div>
            </div>
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                >
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <Typography variant="small">{notification.title}</Typography>
                    <Typography variant="muted">{notification.description}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <Check className="mr-2 h-4 w-4" /> {t('docs.card.notifications.markAllAsRead')}
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* With Status */}
      <section className="space-y-4 pt-4 border-t">
        <div>
          <Typography variant="h2">{t('docs.card.withStatus.title')}</Typography>
          <Typography variant="muted">{t('docs.card.withStatus.description')}</Typography>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('docs.card.withStatus.active')}</CardTitle>
                <Badge>{t('docs.card.withStatus.active')}</Badge>
              </div>
              <CardDescription>{t('docs.card.withStatus.activeDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">{t('docs.card.withStatus.projectInDevelopment')}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('docs.card.withStatus.paused')}</CardTitle>
                <Badge variant="secondary">{t('docs.card.withStatus.paused')}</Badge>
              </div>
              <CardDescription>{t('docs.card.withStatus.pausedDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">{t('docs.card.withStatus.workSuspended')}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('docs.card.withStatus.completed')}</CardTitle>
                <Badge variant="outline">{t('docs.card.withStatus.completed')}</Badge>
              </div>
              <CardDescription>{t('docs.card.withStatus.completedDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">{t('docs.card.withStatus.projectCompleted')}</Typography>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Usage */}
      <section className="space-y-4 pt-4 border-t">
        <Typography variant="h2">{t('docs.common.usage')}</Typography>
        <Card>
          <CardHeader>
            <CardTitle>{t('docs.card.usageExamples.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Typography variant="small" className="mb-2">
                {t('docs.card.usageExamples.basicStructure')}
              </Typography>
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                <code className="text-sm">{`import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

<Card>
  <CardHeader>
    <CardTitle>${t('docs.card.usageExamples.codeTitle')}</CardTitle>
    <CardDescription>${t('docs.card.usageExamples.codeDescription')}</CardDescription>
  </CardHeader>
  <CardContent>
    <p>${t('docs.card.usageExamples.codeContent')}</p>
  </CardContent>
  <CardFooter>
    <Button>${t('docs.card.usageExamples.codeAction')}</Button>
  </CardFooter>
</Card>`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API */}
      <section className="space-y-4 pt-4 border-t">
        <Typography variant="h2">{t('docs.common.apiReference')}</Typography>
        <Card>
          <CardHeader>
            <CardTitle>{t('docs.card.api.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Typography variant="large" className="mb-2">
                Card
              </Typography>
              <Typography variant="muted">
                {t('docs.card.api.cardDescription')}
              </Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardHeader
              </Typography>
              <Typography variant="muted">{t('docs.card.api.cardHeaderDescription')}</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardTitle
              </Typography>
              <Typography variant="muted">{t('docs.card.api.cardTitleDescription')}</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardDescription
              </Typography>
              <Typography variant="muted">{t('docs.card.api.cardDescriptionDescription')}</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardContent
              </Typography>
              <Typography variant="muted">{t('docs.card.api.cardContentDescription')}</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardFooter
              </Typography>
              <Typography variant="muted">{t('docs.card.api.cardFooterDescription')}</Typography>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
