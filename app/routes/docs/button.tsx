import { ChevronRight, Loader2, Mail } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/button'

export const handle = {
  breadcrumb: 'Button'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const ButtonPage = () => {
  const TOC_ITEMS: TocItem[] = [
    { id: 'variants', title: 'Variants', level: 2 },
    { id: 'sizes', title: 'Sizes', level: 2 },
    { id: 'with-icons', title: 'With Icons', level: 2 },
    { id: 'states', title: 'States', level: 2 },
    { id: 'usage', title: 'Usage', level: 2 },
    { id: 'api-reference', title: 'API Reference', level: 2 }
  ]

  const BUTTON_VARIANTS = [
    { variant: 'default' as const, label: 'Default' },
    { variant: 'brand' as const, label: 'Brand' },
    { variant: 'secondary' as const, label: 'Secondary' },
    { variant: 'destructive' as const, label: 'Destructive' },
    { variant: 'outline' as const, label: 'Outline' },
    { variant: 'ghost' as const, label: 'Ghost' },
    { variant: 'link' as const, label: 'Link' }
  ]

  const BUTTON_SIZES = [
    { size: 'sm' as const, label: 'Small' },
    { size: 'default' as const, label: 'Default' },
    { size: 'lg' as const, label: 'Large' },
    { size: 'icon' as const, label: 'Icon', isIcon: true }
  ]

  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Button' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Button</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Clickable button component for actions and navigation.
          </Typography>
        </header>

        <section id='variants' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Variants</Typography>
          <p className='text-xs text-muted-foreground'>Different visual styles</p>

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
        </section>

        <section id='sizes' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Sizes</Typography>
          <p className='text-xs text-muted-foreground'>Different button sizes</p>

          <DocsComponentPreview
            code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><ChevronRight /></Button>`}
          >
            <DocsPreview className='flex items-center flex-wrap gap-4'>
              {BUTTON_SIZES.map(({ size, label, isIcon }) => (
                <Button key={size} size={size}>
                  {isIcon ? <ChevronRight className='h-4 w-4' /> : label}
                </Button>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-icons' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Icons</Typography>
          <p className='text-xs text-muted-foreground'>Buttons with icons</p>

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
        </section>

        <section id='states' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>States</Typography>
          <p className='text-xs text-muted-foreground'>Button states</p>

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
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>

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
                <PropRow
                  name='variant'
                  type="'default' | 'brand' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'"
                  defaultValue="'default'"
                />
                <PropRow
                  name='size'
                  type="'default' | 'sm' | 'lg' | 'icon'"
                  defaultValue="'default'"
                />
                <PropRow name='asChild' type='boolean' defaultValue='false' />
                <PropRow name='disabled' type='boolean' defaultValue='false' />
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

const PropRow = ({
  name,
  type,
  defaultValue
}: {
  name: string
  type: string
  defaultValue: string
}) => {
  return (
    <tr>
      <td className='px-4 py-3'>
        <code className='text-sm font-semibold text-brand'>{name}</code>
      </td>
      <td className='px-4 py-3'>
        <code className='text-xs text-muted-foreground'>{type}</code>
      </td>
      <td className='px-4 py-3'>
        <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>{defaultValue}</code>
      </td>
    </tr>
  )
}

export default ButtonPage
