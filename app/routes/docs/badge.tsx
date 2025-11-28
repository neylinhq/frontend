import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import { Typography } from '@/shared/ui/typography'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/badge'

export const handle = {
  breadcrumb: 'Badge',
}

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

export default function BadgePage() {
  const { t } = useTranslation()

  const TOC_ITEMS: TocItem[] = [
    { id: 'variants', title: t('docs.common.variants'), level: 2 },
    { id: 'usage', title: t('docs.common.usage'), level: 2 },
    { id: 'api-reference', title: t('docs.common.apiReference'), level: 2 },
  ]

  const BADGE_VARIANTS = [
    { variant: 'default' as const, label: t('docs.badge.examples.default') },
    { variant: 'secondary' as const, label: t('docs.badge.examples.secondary') },
    { variant: 'destructive' as const, label: t('docs.badge.examples.destructive') },
    { variant: 'outline' as const, label: t('docs.badge.examples.outline') },
    { variant: 'brand' as const, label: t('docs.badge.examples.brand') },
    { variant: 'success' as const, label: t('docs.badge.examples.success') },
    { variant: 'warning' as const, label: t('docs.badge.examples.warning') },
    { variant: 'info' as const, label: t('docs.badge.examples.info') },
  ]
  return (
    <div className="flex gap-10">
      <div className="flex-1 min-w-0 space-y-10">
        <header className="space-y-4">
          <DocsBreadcrumbs
            items={[
              { label: t('docs.common.components'), href: '/docs/ui/button' },
              { label: 'Badge' },
            ]}
          />
          <div className="flex items-center gap-3">
            <Typography variant="h1">Badge</Typography>
            <Badge variant="brand">{t('docs.common.component')}</Badge>
          </div>
          <Typography variant="lead" className="max-w-2xl">
            {t('docs.badge.lead')}
          </Typography>
        </header>

        <section id="variants" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">{t('docs.common.variants')}</Typography>
          <Typography variant="muted">
            {t('docs.badge.variants.description')}
          </Typography>

          <DocsComponentPreview
            code={`<Badge>${t('docs.badge.examples.default')}</Badge>
<Badge variant="secondary">${t('docs.badge.examples.secondary')}</Badge>
<Badge variant="destructive">${t('docs.badge.examples.destructive')}</Badge>
<Badge variant="outline">${t('docs.badge.examples.outline')}</Badge>
<Badge variant="brand">${t('docs.badge.examples.brand')}</Badge>
<Badge variant="success">${t('docs.badge.examples.success')}</Badge>
<Badge variant="warning">${t('docs.badge.examples.warning')}</Badge>
<Badge variant="info">${t('docs.badge.examples.info')}</Badge>`}
          >
            <DocsPreview className="flex flex-wrap gap-3">
              {BADGE_VARIANTS.map(({ variant, label }) => (
                <Badge key={variant} variant={variant}>
                  {label}
                </Badge>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id="usage" className="scroll-mt-20 space-y-4 pt-6 border-t">
          <Typography variant="h2">{t('docs.common.usage')}</Typography>

          <DocsCodeBlock
            language="tsx"
            code={`import { Badge } from '@/shared/ui/badge'

export function StatusBadge({ status }: { status: '${t('docs.badge.usage.active')}' | '${t('docs.badge.usage.inactive')}' }) {
  return (
    <Badge variant={status === '${t('docs.badge.usage.active')}' ? 'success' : 'secondary'}>
      {status}
    </Badge>
  )
}`}
          />
        </section>

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
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">variant</code></td>
                  <td className="px-4 py-3"><code className="text-xs text-muted-foreground">'default' | 'secondary' | 'destructive' | 'outline' | 'brand' | 'success' | 'warning' | 'info'</code></td>
                  <td className="px-4 py-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">'default'</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DocsToc items={TOC_ITEMS} className="hidden xl:block" />
    </div>
  )
}
