import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/input'

export const handle = {
  breadcrumb: 'Input'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-label', title: 'With Label', level: 2 },
  { id: 'types', title: 'Types', level: 2 },
  { id: 'states', title: 'States', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const InputPage = () => {
  return (
    <DocsPageLayout
      title='Input'
      description='Text input field for forms and user data entry.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple input field'>
        <DocsComponentPreview code={`<Input placeholder="Enter text..." />`}>
          <DocsPreview>
            <Input placeholder='Enter text...' className='max-w-sm' />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-label' title='With Label' description='Input with associated label'>
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
      </DocsSection>

      <DocsSection id='types' title='Types' description='Different HTML input types'>
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
      </DocsSection>

      <DocsSection id='states' title='States' description='Disabled state'>
        <DocsComponentPreview code={`<Input disabled placeholder="Disabled" />`}>
          <DocsPreview>
            <Input disabled placeholder='Disabled' className='max-w-sm' />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
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
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='props'
          rows={[
            { name: 'type', type: 'string', defaultValue: "'text'" },
            { name: 'placeholder', type: 'string', defaultValue: '-' },
            { name: 'disabled', type: 'boolean', defaultValue: 'false' }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default InputPage
