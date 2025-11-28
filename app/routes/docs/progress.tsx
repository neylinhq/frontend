import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/ui/badge'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { Progress } from '@/shared/ui/progress'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/progress'

export const handle = {
  breadcrumb: 'Progress'
}

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'values', title: 'Values', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

export default function ProgressPage() {
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Progress' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Progress</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Displays an indicator showing the completion progress of a task. Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <DocsComponentPreview code={`<Progress value={33} />`}>
            <DocsPreview>
              <Progress value={33} className='w-full max-w-md' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='values' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Values</Typography>
          <DocsComponentPreview
            code={`<Progress value={0} />
<Progress value={25} />
<Progress value={50} />
<Progress value={75} />
<Progress value={100} />`}
          >
            <DocsPreview className='flex flex-col gap-4 w-full max-w-md'>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground'>0%</span>
                <Progress value={0} />
              </div>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground'>25%</span>
                <Progress value={25} />
              </div>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground'>50%</span>
                <Progress value={50} />
              </div>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground'>75%</span>
                <Progress value={75} />
              </div>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground'>100%</span>
                <Progress value={100} />
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
          <DocsCodeBlock
            language='tsx'
            code={`import { Progress } from '@/shared/ui/progress'

export function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
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
