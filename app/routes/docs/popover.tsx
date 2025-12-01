import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/popover'

export const handle = {
  breadcrumb: 'Popover'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-form', title: 'With Form', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const PopoverPage = () => {
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Popover' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Popover</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Displays rich content in a portal, triggered by a button. Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <DocsComponentPreview
            code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Place content for the popover here.</p>
  </PopoverContent>
</Popover>`}
          >
            <DocsPreview>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'>Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Dimensions</h4>
                    <p className='text-sm text-muted-foreground'>
                      Set the dimensions for the layer.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-form' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Form</Typography>
          <DocsComponentPreview
            code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Set Dimensions</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium">Dimensions</h4>
        <p className="text-sm text-muted-foreground">
          Set the dimensions for the layer.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="width">Width</Label>
        <Input id="width" defaultValue="100%" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="height">Height</Label>
        <Input id="height" defaultValue="25px" />
      </div>
    </div>
  </PopoverContent>
</Popover>`}
          >
            <DocsPreview>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'>Set Dimensions</Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='grid gap-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium'>Dimensions</h4>
                      <p className='text-sm text-muted-foreground'>
                        Set the dimensions for the layer.
                      </p>
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='width'>Width</Label>
                      <Input id='width' defaultValue='100%' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='height'>Height</Label>
                      <Input id='height' defaultValue='25px' />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
          <DocsCodeBlock
            language='tsx'
            code={`import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

export function ColorPicker() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start">
          <div className="h-4 w-4 rounded bg-blue-500 mr-2" />
          Pick a color
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        {/* Color picker content */}
      </PopoverContent>
    </Popover>
  )
}`}
          />
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default PopoverPage
