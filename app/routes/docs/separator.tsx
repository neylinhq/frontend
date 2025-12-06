import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Separator } from '@/shared/components/separator'
import { Typography } from '@/shared/components/typography'
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
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Separator' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Separator</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Visually or semantically separates content. Built with Radix UI.
          </Typography>
        </header>

        <section id='horizontal' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Horizontal</Typography>
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
        </section>

        <section id='vertical' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Vertical</Typography>
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
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
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
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default SeparatorPage
