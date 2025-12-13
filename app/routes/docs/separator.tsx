import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Separator } from '@/shared/components/separator'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/separator'

export const handle = {
  breadcrumb: 'Separator'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'horizontal', title: 'Horizontal', level: 2 },
  { id: 'vertical', title: 'Vertical', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const SeparatorPage = () => {
  return (
    <DocsPageLayout
      title='Separator'
      description='Visually or semantically separates content. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='horizontal' title='Horizontal' description='Horizontal separator'>
        <DocsComponentPreview
          code={`<div>
  <div className="space-y-1">
    <h4 className="text-sm font-medium">Section Title</h4>
    <p className="text-sm text-muted-foreground">Section description</p>
  </div>
  <Separator className="my-4" />
  <div>Content below separator</div>
</div>`}
        >
          <DocsPreview>
            <div className='w-full max-w-md'>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium'>Radix Primitives</h4>
                <p className='text-sm text-muted-foreground'>
                  An open-source UI component library.
                </p>
              </div>
              <Separator className='my-4' />
              <div className='flex h-5 items-center space-x-4 text-sm'>
                <div>Blog</div>
                <Separator orientation='vertical' />
                <div>Docs</div>
                <Separator orientation='vertical' />
                <div>Source</div>
              </div>
            </div>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='vertical' title='Vertical' description='Vertical separator'>
        <DocsComponentPreview
          code={`<div className="flex h-5 items-center space-x-4 text-sm">
  <div>Blog</div>
  <Separator orientation="vertical" />
  <div>Docs</div>
  <Separator orientation="vertical" />
  <div>Source</div>
</div>`}
        >
          <DocsPreview>
            <div className='flex h-5 items-center space-x-4 text-sm'>
              <div>Blog</div>
              <Separator orientation='vertical' />
              <div>Docs</div>
              <Separator orientation='vertical' />
              <div>Source</div>
            </div>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Separator } from '@/shared/components/separator'

export function NavLinks() {
  return (
    <div className="flex items-center gap-4">
      <a href="/home">Home</a>
      <Separator orientation="vertical" className="h-4" />
      <a href="/about">About</a>
      <Separator orientation="vertical" className="h-4" />
      <a href="/contact">Contact</a>
    </div>
  )
}`}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default SeparatorPage
