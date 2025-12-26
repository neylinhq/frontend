import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/textarea'

export const handle = {
  breadcrumb: 'Textarea'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-label', title: 'With Label', level: 2 },
  { id: 'states', title: 'States', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const TextareaPage = () => {
  return (
    <DocsPageLayout
      title='Textarea'
      description='A multi-line text input component for longer text content.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Basic textarea input'>
        <DocsComponentPreview code={`<Textarea placeholder="Type your message here." />`}>
          <DocsPreview>
            <Textarea placeholder='Type your message here.' className='max-w-sm' />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-label' title='With Label' description='Textarea with associated label'>
        <DocsComponentPreview
          code={`<div className="space-y-2">
  <Label htmlFor="message">Your message</Label>
  <Textarea id="message" placeholder="Type your message here." />
</div>`}
        >
          <DocsPreview>
            <div className='space-y-2 w-full max-w-sm'>
              <Label htmlFor='message'>Your message</Label>
              <Textarea id='message' placeholder='Type your message here.' />
            </div>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='states' title='States' description='Disabled textarea state'>
        <DocsComponentPreview code={`<Textarea disabled placeholder="Disabled textarea" />`}>
          <DocsPreview>
            <Textarea disabled placeholder='Disabled textarea' className='max-w-sm' />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Textarea } from '@/shared/components/textarea'

export function FeedbackForm() {
  return (
    <Textarea
      placeholder="Share your feedback..."
      rows={5}
    />
  )
}`}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default TextareaPage
