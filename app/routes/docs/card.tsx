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
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Typography variant="h1">Card</Typography>
        <Typography variant="lead">
          Универсальный контейнер для группировки связанного контента.
        </Typography>
      </div>

      {/* Basic Example */}
      <section className="space-y-4">
        <div>
          <Typography variant="h2">Базовый пример</Typography>
          <Typography variant="muted">Простая карточка с заголовком и контентом</Typography>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Название карточки</CardTitle>
              <CardDescription>Описание карточки</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="p">
                Контент карточки. Здесь может быть любая информация, формы, списки и другие элементы.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>С футером</CardTitle>
              <CardDescription>Карточка с действиями в футере</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="p">Основной контент карточки</Typography>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Отмена</Button>
              <Button>Сохранить</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* With Notifications */}
      <section className="space-y-4 pt-4 border-t">
        <div>
          <Typography variant="h2">Уведомления</Typography>
          <Typography variant="muted">Карточка со списком уведомлений</Typography>
        </div>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
            <CardDescription>У вас 3 непрочитанных сообщения.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <BellRing />
              <div className="flex-1 space-y-1">
                <Typography variant="small">Push уведомления</Typography>
                <Typography variant="muted">Отправлять уведомления на устройство.</Typography>
              </div>
            </div>
            <div>
              {[
                {
                  title: 'Новая функция доступна',
                  description: '2 часа назад',
                },
                {
                  title: 'Обновление системы',
                  description: '1 день назад',
                },
                {
                  title: 'Новый комментарий',
                  description: '3 дня назад',
                },
              ].map((notification, index) => (
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
              <Check className="mr-2 h-4 w-4" /> Отметить все как прочитанное
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* With Status */}
      <section className="space-y-4 pt-4 border-t">
        <div>
          <Typography variant="h2">Со статусом</Typography>
          <Typography variant="muted">Карточки с различными статусами</Typography>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Активный</CardTitle>
                <Badge>Active</Badge>
              </div>
              <CardDescription>Активный проект</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">Проект в разработке</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>На паузе</CardTitle>
                <Badge variant="secondary">Paused</Badge>
              </div>
              <CardDescription>Приостановленный проект</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">Работа приостановлена</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Завершен</CardTitle>
                <Badge variant="outline">Completed</Badge>
              </div>
              <CardDescription>Завершенный проект</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">Проект завершен</Typography>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Usage */}
      <section className="space-y-4 pt-4 border-t">
        <Typography variant="h2">Usage</Typography>
        <Card>
          <CardHeader>
            <CardTitle>Примеры использования</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Typography variant="small" className="mb-2">
                Базовая структура:
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
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Контент карточки</p>
  </CardContent>
  <CardFooter>
    <Button>Действие</Button>
  </CardFooter>
</Card>`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API */}
      <section className="space-y-4 pt-4 border-t">
        <Typography variant="h2">API Reference</Typography>
        <Card>
          <CardHeader>
            <CardTitle>Компоненты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Typography variant="large" className="mb-2">
                Card
              </Typography>
              <Typography variant="muted">
                Корневой компонент карточки. Принимает стандартные HTML атрибуты div.
              </Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardHeader
              </Typography>
              <Typography variant="muted">Шапка карточки с заголовком и описанием.</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardTitle
              </Typography>
              <Typography variant="muted">Заголовок карточки (h3 по умолчанию).</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardDescription
              </Typography>
              <Typography variant="muted">Описание карточки с приглушенным цветом.</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardContent
              </Typography>
              <Typography variant="muted">Основной контент карточки.</Typography>
            </div>
            <div>
              <Typography variant="large" className="mb-2">
                CardFooter
              </Typography>
              <Typography variant="muted">Футер карточки для действий и кнопок.</Typography>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
