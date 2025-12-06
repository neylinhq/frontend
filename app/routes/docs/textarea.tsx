import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { Typography } from '@/shared/components/typography'
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
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Textarea' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Textarea</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            A multi-line text input component for longer text content.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <DocsComponentPreview code={`<Textarea placeholder="Type your message here." />`}>
            <DocsPreview>
              <Textarea placeholder='Type your message here.' className='max-w-sm' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-label' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Label</Typography>
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
        </section>

        <section id='states' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>States</Typography>
          <DocsComponentPreview code={`<Textarea disabled placeholder="Disabled textarea" />`}>
            <DocsPreview>
              <Textarea disabled placeholder='Disabled textarea' className='max-w-sm' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
          <DocsCodeBlock
            language='tsx'
            code={`import { Textarea } from '@/shared/components/textarea'

export function FeedbackForm() {
  return (
    <Textarea
      placeholder="Share your feedback..."
      rows={5}
      onChange={(e) => console.log(e.target.value)}
    />
  )
}`}
          />
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default TextareaPage
