import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/input'

export const handle = {
  breadcrumb: 'Input'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const InputPage = () => {
  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: 'Basic', level: 2 },
    { id: 'with-label', title: 'With Label', level: 2 },
    { id: 'types', title: 'Types', level: 2 },
    { id: 'states', title: 'States', level: 2 },
    { id: 'usage', title: 'Usage', level: 2 },
    { id: 'api-reference', title: 'API Reference', level: 2 }
  ]
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Input' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Input</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Text input field for forms and user data entry.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <p className='text-xs text-muted-foreground'>Simple input field</p>

          <DocsComponentPreview code={`<Input placeholder="Enter text..." />`}>
            <DocsPreview>
              <Input placeholder='Enter text...' className='max-w-sm' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-label' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Label</Typography>
          <p className='text-xs text-muted-foreground'>Input with associated label</p>

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

        <section id='types' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Types</Typography>
          <p className='text-xs text-muted-foreground'>Different HTML input types</p>

          <DocsComponentPreview
            code={`<Input type="text" placeholder="Text" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Number" />`}
          >
            <DocsPreview className='flex flex-col gap-4 w-full max-w-sm'>
              <Input type='text' placeholder='Text' />
              <Input type='email' placeholder='Email' />
              <Input type='password' placeholder='Password' />
              <Input type='number' placeholder='Number' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='states' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>States</Typography>
          <p className='text-xs text-muted-foreground'>Disabled state</p>

          <DocsComponentPreview code={`<Input disabled placeholder="Disabled" />`}>
            <DocsPreview>
              <Input disabled placeholder='Disabled' className='max-w-sm' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'

export function MyForm() {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        placeholder="Enter your name"
        onChange={(e) => console.log(e.target.value)}
      />
    </div>
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
                    <code className='text-sm font-semibold text-brand'>type</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>'text'</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>placeholder</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>-</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>disabled</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>boolean</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>false</code>
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

export default InputPage
