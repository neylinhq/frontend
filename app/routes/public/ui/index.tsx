import { Link } from 'react-router'
import { ArrowRight, Palette, Type, Package } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Typography } from '@/shared/ui/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/index'

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

export default function UiIndexPage() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="space-y-3">
        <Typography variant="h1">UI Component Library</Typography>
        <Typography variant="lead" className="max-w-3xl">
          Коллекция переиспользуемых компонентов, построенных на Radix UI и Tailwind CSS.
          Поддержка 3 цветовых тем, dark mode и полная типизация TypeScript.
        </Typography>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
        <QuickLinkCard
          icon={<Palette className="h-6 w-6" />}
          title="Colors"
          description="Палитра цветов и семантические токены для всех тем"
          href="/public/ui/colors"
        />
        <QuickLinkCard
          icon={<Type className="h-6 w-6" />}
          title="Typography"
          description="Типографическая система и текстовые стили"
          href="/public/ui/typography"
        />
        <QuickLinkCard
          icon={<Package className="h-6 w-6" />}
          title="Components"
          description="25+ готовых компонентов с примерами использования"
          href="/public/ui/button"
        />
      </div>

      {/* Features */}
      <div className="pt-8 space-y-4">
        <Typography variant="h2">Возможности</Typography>
        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureItem
            title="Темизация"
            description="3 цветовые темы (Classic, Vanilla, Vivid) + Dark mode"
          />
          <FeatureItem
            title="Доступность"
            description="Radix UI primitives с поддержкой клавиатуры и ARIA"
          />
          <FeatureItem
            title="TypeScript"
            description="Полная типизация всех компонентов и пропсов"
          />
          <FeatureItem
            title="Responsive"
            description="Адаптивный дизайн для всех размеров экранов"
          />
        </div>
      </div>

      {/* Getting Started */}
      <div className="pt-8 space-y-4 border-t">
        <Typography variant="h2">Начало работы</Typography>
        <Typography variant="p">
          Все компоненты находятся в <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">src/shared/ui/</code>.
          Используйте навигацию слева для просмотра документации и примеров каждого компонента.
        </Typography>
        <div className="flex gap-3 pt-2">
          <Button asChild>
            <Link to="/public/ui/colors">
              Посмотреть цвета
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/public/ui/button">Компоненты</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuickLinkCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link to={href} className="group">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="mb-2 text-primary">{icon}</div>
          <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <Typography variant="large">{title}</Typography>
      <Typography variant="muted">{description}</Typography>
    </div>
  )
}
