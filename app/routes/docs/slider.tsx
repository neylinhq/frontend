import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Slider } from '@/shared/components/slider'
import { Typography } from '@/shared/components/typography'
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
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Slider' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Slider</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            An input for selecting a value from a range. Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <DocsComponentPreview code={`<Slider defaultValue={[50]} max={100} step={1} />`}>
            <DocsPreview>
              <Slider defaultValue={[50]} max={100} step={1} className='w-full max-w-md' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-steps' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Steps</Typography>
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
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
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
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default SliderPage
