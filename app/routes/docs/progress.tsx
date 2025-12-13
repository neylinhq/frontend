import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Progress } from '@/shared/components/progress'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/progress'

export const handle = {
  breadcrumb: 'Progress'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'values', title: 'Values', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const ProgressPage = () => {
  return (
    <DocsPageLayout
      title='Progress'
      description='Displays an indicator showing the completion progress of a task. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Basic progress indicator'>
        <DocsComponentPreview code={`<Progress value={33} />`}>
          <DocsPreview>
            <Progress value={33} className='w-full max-w-md' />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='values' title='Values' description='Different progress values'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Progress } from '@/shared/components/progress'

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
      </DocsSection>
    </DocsPageLayout>
  )
}

export default ProgressPage
