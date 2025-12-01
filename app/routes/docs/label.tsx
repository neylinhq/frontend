import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/label'

export const handle = {
  breadcrumb: 'Label'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-input', title: 'With Input', level: 2 },
  { id: 'with-checkbox', title: 'With Checkbox', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const LabelPage = () => {
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Label' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Label</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Renders an accessible label associated with controls. Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <DocsComponentPreview code={`<Label>Email address</Label>`}>
            <DocsPreview>
              <Label>Email address</Label>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-input' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Input</Typography>
          <DocsComponentPreview
            code={`<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>`}
          >
            <DocsPreview>
              <div className='space-y-2 w-full max-w-sm'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' placeholder='email@example.com' />
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-checkbox' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Checkbox</Typography>
          <DocsComponentPreview
            code={`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>`}
          >
            <DocsPreview>
              <div className='flex items-center space-x-2'>
                <Checkbox id='terms' />
                <Label htmlFor='terms'>Accept terms and conditions</Label>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
          <DocsCodeBlock
            language='tsx'
            code={`import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'

export function FormField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter username" />
    </div>
  )
}`}
          />
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default LabelPage
