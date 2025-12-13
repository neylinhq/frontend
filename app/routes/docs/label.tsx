import { Checkbox } from '@/shared/components/checkbox'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { getMeta } from '@/shared/lib/get-meta'
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
    <DocsPageLayout
      title='Label'
      description='Renders an accessible label associated with controls. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic'>
        <DocsComponentPreview code={`<Label>Email address</Label>`}>
          <DocsPreview>
            <Label>Email address</Label>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-input' title='With Input'>
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

      <DocsSection id='with-checkbox' title='With Checkbox'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Label } from '@/shared/components/label'
import { Input } from '@/shared/components/input'

export function FormField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter username" />
    </div>
  )
}`}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default LabelPage
