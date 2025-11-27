import { Mail, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Typography } from '@/shared/ui/typography'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/button'

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

const BUTTON_VARIANTS = [
  { variant: 'default' as const, label: 'Default' },
  { variant: 'secondary' as const, label: 'Secondary' },
  { variant: 'destructive' as const, label: 'Destructive' },
  { variant: 'outline' as const, label: 'Outline' },
  { variant: 'ghost' as const, label: 'Ghost' },
  { variant: 'link' as const, label: 'Link' },
]

const BUTTON_SIZES = [
  { size: 'sm' as const, label: 'Small' },
  { size: 'default' as const, label: 'Default' },
  { size: 'lg' as const, label: 'Large' },
  { size: 'icon' as const, label: 'Icon', isIcon: true },
]

export default function ButtonPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Typography variant="h1">Button</Typography>
        <Typography variant="lead">
          Универсальный компонент кнопки с различными вариантами и состояниями.
        </Typography>
      </div>

      {/* Variants */}
      <section className="space-y-4">
        <div>
          <Typography variant="h2">Варианты</Typography>
          <Typography variant="muted">
            Доступные варианты оформления кнопок
          </Typography>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Стили кнопок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {BUTTON_VARIANTS.map(({ variant, label }) => (
                <Button key={variant} variant={variant}>
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <div>
          <Typography variant="h2">Размеры</Typography>
          <Typography variant="muted">
            Доступные размеры кнопок
          </Typography>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Размеры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center flex-wrap gap-4">
              {BUTTON_SIZES.map(({ size, label, isIcon }) => (
                <Button key={size} size={size}>
                  {isIcon ? <ChevronRight className="h-4 w-4" /> : label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <div>
          <Typography variant="h2">С иконками</Typography>
          <Typography variant="muted">
            Кнопки с иконками из Lucide
          </Typography>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Иконки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Login with Email
              </Button>
              <Button variant="secondary">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button variant="outline">
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* States */}
      <section className="space-y-4">
        <div>
          <Typography variant="h2">Состояния</Typography>
          <Typography variant="muted">
            Disabled и loading состояния
          </Typography>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Состояния</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Typography variant="small" className="mb-2">
                  Disabled:
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Default</Button>
                  <Button variant="secondary" disabled>
                    Secondary
                  </Button>
                  <Button variant="outline" disabled>
                    Outline
                  </Button>
                </div>
              </div>
              <div>
                <Typography variant="small" className="mb-2">
                  Loading:
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Button>
                  <Button variant="secondary" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                Базовое использование:
              </Typography>
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                <code className="text-sm">{`import { Button } from '@/shared/ui/button'

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline" size="sm">Small outline</Button>`}</code>
              </pre>
            </div>
            <div>
              <Typography variant="small" className="mb-2">
                С иконками:
              </Typography>
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                <code className="text-sm">{`import { Mail } from 'lucide-react'

<Button>
  <Mail className="mr-2 h-4 w-4" />
  Login with Email
</Button>`}</code>
              </pre>
            </div>
            <div>
              <Typography variant="small" className="mb-2">
                Как ссылка (с react-router):
              </Typography>
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                <code className="text-sm">{`import { Link } from 'react-router'

<Button asChild>
  <Link to="/dashboard">Go to Dashboard</Link>
</Button>`}</code>
              </pre>
            </div>
            <div>
              <Typography variant="small" className="mb-2">
                Loading состояние:
              </Typography>
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                <code className="text-sm">{`import { Loader2 } from 'lucide-react'

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>`}</code>
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
            <CardTitle>Props</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <PropRow
                name="variant"
                type="'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'"
                defaultValue="'default'"
                description="Вариант оформления кнопки"
              />
              <PropRow
                name="size"
                type="'default' | 'sm' | 'lg' | 'icon'"
                defaultValue="'default'"
                description="Размер кнопки"
              />
              <PropRow
                name="asChild"
                type="boolean"
                defaultValue="false"
                description="Использовать кнопку как обертку для другого элемента (Link, etc)"
              />
              <PropRow
                name="disabled"
                type="boolean"
                defaultValue="false"
                description="Отключить кнопку"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function PropRow({
  name,
  type,
  defaultValue,
  description,
}: {
  name: string
  type: string
  defaultValue: string
  description: string
}) {
  return (
    <div className="grid gap-2 border-b pb-3 last:border-0">
      <div className="flex items-baseline justify-between gap-4">
        <code className="text-sm font-semibold">{name}</code>
        <code className="text-xs text-muted-foreground">{type}</code>
      </div>
      <Typography variant="small" className="text-muted-foreground">
        {description}
      </Typography>
      {defaultValue && (
        <Typography variant="small">
          Default: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{defaultValue}</code>
        </Typography>
      )}
    </div>
  )
}
