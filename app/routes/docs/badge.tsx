import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/badge'

export const handle = {
  breadcrumb: 'Badge'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const BadgePage = () => {
  const TOC_ITEMS: TocItem[] = [
    { id: 'variants', title: 'Variants', level: 2 },
    { id: 'usage', title: 'Usage', level: 2 },
    { id: 'api-reference', title: 'API Reference', level: 2 }
  ]

  const BADGE_VARIANTS = [
    { variant: 'default' as const, label: 'Default' },
    { variant: 'secondary' as const, label: 'Secondary' },
    { variant: 'destructive' as const, label: 'Destructive' },
    { variant: 'outline' as const, label: 'Outline' },
    { variant: 'brand' as const, label: 'Brand' },
    { variant: 'success' as const, label: 'Success' },
    { variant: 'warning' as const, label: 'Warning' },
    { variant: 'info' as const, label: 'Info' }
  ]
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Badge' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Badge</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Small status indicator or label component.
          </Typography>
        </header>

        <section id='variants' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Variants</Typography>
          <p className='text-xs text-muted-foreground'>Different visual styles</p>

          <DocsComponentPreview
            code={`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="brand">Brand</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>`}
          >
            <DocsPreview className='flex flex-wrap gap-3'>
              {BADGE_VARIANTS.map(({ variant, label }) => (
                <Badge key={variant} variant={variant}>
                  {label}
                </Badge>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Badge } from '@/shared/components/badge'

export function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <Badge variant={status === 'active' ? 'success' : 'secondary'}>
      {status}
    </Badge>
  )
}`}
          />
        </section>

        <section id='api-reference' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>API Reference</Typography>

          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>Prop</th>
                  <th className='text-left px-4 py-3 font-medium'>Type</th>
                  <th className='text-left px-4 py-3 font-medium'>Default</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>variant</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      'default' | 'secondary' | 'destructive' | 'outline' | 'brand' | 'success' |
                      'warning' | 'info'
                    </code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>'default'</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default BadgePage
