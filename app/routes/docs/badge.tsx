import { Badge } from '@/shared/components/badge'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { BADGE_VARIANTS } from '@/shared/config/docs-examples'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/badge'

export const handle = {
  breadcrumb: 'Badge'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'variants', title: 'Variants', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const BadgePage = () => {
  return (
    <DocsPageLayout
      title='Badge'
      description='Small status indicator or label component.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='variants' title='Variants' description='Different visual styles'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
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
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='props'
          rows={[
            {
              name: 'variant',
              type: "'default' | 'secondary' | 'destructive' | 'outline' | 'brand' | 'success' | 'warning' | 'info'",
              defaultValue: "'default'"
            }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default BadgePage
