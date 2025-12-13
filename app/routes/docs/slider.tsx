import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Slider } from '@/shared/components/slider'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/slider'

export const handle = {
  breadcrumb: 'Slider'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-steps', title: 'With Steps', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const SliderPage = () => {
  return (
    <DocsPageLayout
      title='Slider'
      description='An input for selecting a value from a range. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Basic slider input'>
        <DocsComponentPreview code={`<Slider defaultValue={[50]} max={100} step={1} />`}>
          <DocsPreview>
            <Slider defaultValue={[50]} max={100} step={1} className='w-full max-w-md' />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-steps' title='With Steps' description='Sliders with different steps'>
        <DocsComponentPreview code={`<Slider defaultValue={[25]} max={100} step={25} />`}>
          <DocsPreview className='flex flex-col gap-4 w-full max-w-md'>
            <div className='space-y-2'>
              <span className='text-xs text-muted-foreground'>Step: 25</span>
              <Slider defaultValue={[25]} max={100} step={25} />
            </div>
            <div className='space-y-2'>
              <span className='text-xs text-muted-foreground'>Step: 10</span>
              <Slider defaultValue={[30]} max={100} step={10} />
            </div>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Slider } from '@/shared/components/slider'

export function VolumeControl() {
  const [volume, setVolume] = useState([50])

  return (
    <div className="space-y-2">
      <label className="text-sm">Volume: {volume[0]}%</label>
      <Slider
        value={volume}
        onValueChange={setVolume}
        max={100}
        step={1}
      />
    </div>
  )
}`}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default SliderPage
