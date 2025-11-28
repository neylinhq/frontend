import { Mail, Loader2, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Typography } from '@/shared/ui/typography'
import { Badge } from '@/shared/ui/badge'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/button'

export const handle = {
  breadcrumb: 'Button',
}

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

export default function ButtonPage() {
  const { t } = useTranslation()

  const TOC_ITEMS: TocItem[] = [
    { id: 'variants', title: t('docs.common.variants'), level: 2 },
    { id: 'sizes', title: t('docs.common.sizes'), level: 2 },
    { id: 'with-icons', title: t('docs.button.withIcons.title'), level: 2 },
    { id: 'states', title: t('docs.common.states'), level: 2 },
    { id: 'usage', title: t('docs.common.usage'), level: 2 },
    { id: 'api-reference', title: t('docs.common.apiReference'), level: 2 },
  ]

  const BUTTON_VARIANTS = [
    { variant: 'default' as const, label: t('docs.button.examples.default') },
    { variant: 'brand' as const, label: t('docs.button.examples.brand') },
    { variant: 'secondary' as const, label: t('docs.button.examples.secondary') },
    { variant: 'destructive' as const, label: t('docs.button.examples.destructive') },
    { variant: 'outline' as const, label: t('docs.button.examples.outline') },
    { variant: 'ghost' as const, label: t('docs.button.examples.ghost') },
    { variant: 'link' as const, label: t('docs.button.examples.link') },
  ]

  const BUTTON_SIZES = [
    { size: 'sm' as const, label: t('docs.button.examples.small') },
    { size: 'default' as const, label: t('docs.button.examples.default') },
    { size: 'lg' as const, label: t('docs.button.examples.large') },
    { size: 'icon' as const, label: t('docs.button.examples.icon'), isIcon: true },
  ]

  return (
    <div className="flex gap-10">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-10">
        {/* Header */}
        <header className="space-y-4">
          <DocsBreadcrumbs
            items={[
              { label: t('docs.common.components'), href: '/docs/ui/button' },
              { label: 'Button' },
            ]}
          />
          <div className="flex items-center gap-3">
            <Typography variant="h1">Button</Typography>
            <Badge variant="brand">{t('docs.common.component')}</Badge>
          </div>
          <Typography variant="lead" className="max-w-2xl">
            {t('docs.button.lead')}
          </Typography>
        </header>

        {/* Variants */}
        <section id="variants" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">{t('docs.common.variants')}</Typography>
          <Typography variant="muted">
            {t('docs.button.variants.description')}
          </Typography>

          <DocsComponentPreview
            code={`<Button>${t('docs.button.examples.default')}</Button>
<Button variant="brand">${t('docs.button.examples.brand')}</Button>
<Button variant="secondary">${t('docs.button.examples.secondary')}</Button>
<Button variant="destructive">${t('docs.button.examples.destructive')}</Button>
<Button variant="outline">${t('docs.button.examples.outline')}</Button>
<Button variant="ghost">${t('docs.button.examples.ghost')}</Button>
<Button variant="link">${t('docs.button.examples.link')}</Button>`}
          >
            <DocsPreview className="flex flex-wrap gap-4">
              {BUTTON_VARIANTS.map(({ variant, label }) => (
                <Button key={variant} variant={variant}>
                  {label}
                </Button>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        {/* Sizes */}
        <section id="sizes" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">{t('docs.common.sizes')}</Typography>
          <Typography variant="muted">
            {t('docs.button.sizes.description')}
          </Typography>

          <DocsComponentPreview
            code={`<Button size="sm">${t('docs.button.examples.small')}</Button>
<Button size="default">${t('docs.button.examples.default')}</Button>
<Button size="lg">${t('docs.button.examples.large')}</Button>
<Button size="icon"><ChevronRight /></Button>`}
          >
            <DocsPreview className="flex items-center flex-wrap gap-4">
              {BUTTON_SIZES.map(({ size, label, isIcon }) => (
                <Button key={size} size={size}>
                  {isIcon ? <ChevronRight className="h-4 w-4" /> : label}
                </Button>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        {/* With Icons */}
        <section id="with-icons" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">{t('docs.button.withIcons.title')}</Typography>
          <Typography variant="muted">
            {t('docs.button.withIcons.description')}
          </Typography>

          <DocsComponentPreview
            code={`<Button>
  <Mail className="mr-2 h-4 w-4" />
  ${t('docs.button.examples.loginWithEmail')}
</Button>

<Button variant="secondary">
  <Mail className="mr-2 h-4 w-4" />
  ${t('docs.button.examples.sendEmail')}
</Button>

<Button variant="outline">
  ${t('docs.button.examples.continue')}
  <ChevronRight className="ml-2 h-4 w-4" />
</Button>`}
          >
            <DocsPreview className="flex flex-wrap gap-4">
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                {t('docs.button.examples.loginWithEmail')}
              </Button>
              <Button variant="secondary">
                <Mail className="mr-2 h-4 w-4" />
                {t('docs.button.examples.sendEmail')}
              </Button>
              <Button variant="outline">
                {t('docs.button.examples.continue')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        {/* States */}
        <section id="states" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">{t('docs.common.states')}</Typography>
          <Typography variant="muted">
            {t('docs.button.states.description')}
          </Typography>

          <div className="space-y-6">
            <div>
              <Typography variant="small" className="mb-3 font-medium">
                {t('docs.common.disabled')}
              </Typography>
              <DocsComponentPreview
                code={`<Button disabled>${t('docs.button.examples.default')}</Button>
<Button variant="secondary" disabled>${t('docs.button.examples.secondary')}</Button>
<Button variant="outline" disabled>${t('docs.button.examples.outline')}</Button>`}
              >
                <DocsPreview className="flex flex-wrap gap-4">
                  <Button disabled>{t('docs.button.examples.default')}</Button>
                  <Button variant="secondary" disabled>
                    {t('docs.button.examples.secondary')}
                  </Button>
                  <Button variant="outline" disabled>
                    {t('docs.button.examples.outline')}
                  </Button>
                </DocsPreview>
              </DocsComponentPreview>
            </div>

            <div>
              <Typography variant="small" className="mb-3 font-medium">
                {t('docs.common.loading')}
              </Typography>
              <DocsComponentPreview
                code={`<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ${t('docs.button.examples.pleaseWait')}
</Button>`}
              >
                <DocsPreview className="flex flex-wrap gap-4">
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('docs.button.examples.pleaseWait')}
                  </Button>
                  <Button variant="secondary" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('docs.common.loading')}
                  </Button>
                </DocsPreview>
              </DocsComponentPreview>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section id="usage" className="scroll-mt-20 space-y-4 pt-6 border-t">
          <Typography variant="h2">{t('docs.common.usage')}</Typography>

          <div className="space-y-6">
            <div>
              <Typography variant="small" className="mb-3 font-medium">
                {t('docs.common.basicImport')}
              </Typography>
              <DocsCodeBlock
                language="tsx"
                code={`import { Button } from '@/shared/ui/button'

export function MyComponent() {
  return (
    <Button onClick={() => console.log('clicked')}>
      Click me
    </Button>
  )
}`}
              />
            </div>

            <div>
              <Typography variant="small" className="mb-3 font-medium">
                {t('docs.button.usage.asLinkTitle')}
              </Typography>
              <DocsCodeBlock
                language="tsx"
                code={`import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'
import { DASHBOARD_ROUTES } from '@/shared/config'

<Button asChild>
  <Link to={DASHBOARD_ROUTES.overview}>Go to Dashboard</Link>
</Button>`}
              />
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section id="api-reference" className="scroll-mt-20 space-y-4 pt-6 border-t">
          <Typography variant="h2">{t('docs.common.apiReference')}</Typography>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{t('docs.common.prop')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('docs.common.type')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('docs.common.default')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <PropRow
                  name="variant"
                  type="'default' | 'brand' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'"
                  defaultValue="'default'"
                />
                <PropRow
                  name="size"
                  type="'default' | 'sm' | 'lg' | 'icon'"
                  defaultValue="'default'"
                />
                <PropRow
                  name="asChild"
                  type="boolean"
                  defaultValue="false"
                />
                <PropRow
                  name="disabled"
                  type="boolean"
                  defaultValue="false"
                />
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Table of Contents */}
      <DocsToc items={TOC_ITEMS} className="hidden xl:block" />
    </div>
  )
}

function PropRow({
  name,
  type,
  defaultValue,
}: {
  name: string
  type: string
  defaultValue: string
}) {
  return (
    <tr>
      <td className="px-4 py-3">
        <code className="text-sm font-semibold text-brand">{name}</code>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs text-muted-foreground">{type}</code>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{defaultValue}</code>
      </td>
    </tr>
  )
}
