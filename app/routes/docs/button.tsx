import { ChevronRight, Loader2, Mail } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Typography } from '@/shared/components/typography'
import { BUTTON_SIZES, BUTTON_VARIANTS } from '@/shared/config/docs-examples'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/button'

export const handle = {
  breadcrumb: 'Button'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'variants', title: 'Variants', level: 2 },
  { id: 'sizes', title: 'Sizes', level: 2 },
  { id: 'with-icons', title: 'With Icons', level: 2 },
  { id: 'states', title: 'States', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const ButtonPage = () => {
  return (
    <DocsPageLayout
      title='Button'
      description='Clickable button component for actions and navigation.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='variants' title='Variants' description='Different visual styles'>
        <DocsComponentPreview
          code={`<Button>Default</Button>
<Button variant="brand">Brand</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
        >
          <DocsPreview className='flex flex-wrap gap-4'>
            {BUTTON_VARIANTS.map(({ variant, label }) => (
              <Button key={variant} variant={variant}>
                {label}
              </Button>
            ))}
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='sizes' title='Sizes' description='Different button sizes'>
        <DocsComponentPreview
          code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><ChevronRight /></Button>`}
        >
          <DocsPreview className='flex items-center flex-wrap gap-4'>
            {BUTTON_SIZES.map(({ size, label, content }) => (
              <Button key={size} size={size}>
                {content ?? <ChevronRight className='h-4 w-4' />}
              </Button>
            ))}
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-icons' title='With Icons' description='Buttons with icons'>
        <DocsComponentPreview
          code={`<Button>
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
</Button>`}
        >
          <DocsPreview className='flex flex-wrap gap-4'>
            <Button>
              <Mail className='mr-2 h-4 w-4' />
              Login with Email
            </Button>
            <Button variant='secondary'>
              <Mail className='mr-2 h-4 w-4' />
              Send Email
            </Button>
            <Button variant='outline'>
              Continue
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='states' title='States' description='Button states'>
        <div className='space-y-6'>
          <div>
            <Typography variant='small' className='mb-3 font-medium'>
              Disabled
            </Typography>
            <DocsComponentPreview
              code={`<Button disabled>Default</Button>
<Button variant="secondary" disabled>Secondary</Button>
<Button variant="outline" disabled>Outline</Button>`}
            >
              <DocsPreview className='flex flex-wrap gap-4'>
                <Button disabled>Default</Button>
                <Button variant='secondary' disabled>
                  Secondary
                </Button>
                <Button variant='outline' disabled>
                  Outline
                </Button>
              </DocsPreview>
            </DocsComponentPreview>
          </div>

          <div>
            <Typography variant='small' className='mb-3 font-medium'>
              Loading
            </Typography>
            <DocsComponentPreview
              code={`<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>`}
            >
              <DocsPreview className='flex flex-wrap gap-4'>
                <Button disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Please wait
                </Button>
                <Button variant='secondary' disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Loading
                </Button>
              </DocsPreview>
            </DocsComponentPreview>
          </div>
        </div>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <div className='space-y-6'>
          <div>
            <p className='text-xs text-muted-foreground mb-3'>Basic import:</p>
            <DocsCodeBlock
              language='tsx'
              code={`import { Button } from '@/shared/components/button'

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
            <p className='text-xs text-muted-foreground mb-3'>As link component:</p>
            <DocsCodeBlock
              language='tsx'
              code={`import { Link } from 'react-router'
import { Button } from '@/shared/components/button'
import { DASHBOARD_ROUTES } from '@/shared/config'

<Button asChild>
  <Link to={DASHBOARD_ROUTES.overview}>Go to Dashboard</Link>
</Button>`}
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='props'
          rows={[
            {
              name: 'variant',
              type: "'default' | 'brand' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'",
              defaultValue: "'default'"
            },
            {
              name: 'size',
              type: "'default' | 'sm' | 'lg' | 'icon'",
              defaultValue: "'default'"
            },
            {
              name: 'asChild',
              type: 'boolean',
              defaultValue: 'false'
            },
            {
              name: 'disabled',
              type: 'boolean',
              defaultValue: 'false'
            }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default ButtonPage
