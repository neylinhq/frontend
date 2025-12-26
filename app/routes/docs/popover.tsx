import { Button } from '@/shared/components/button'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { getMeta } from '@/shared/lib/get-meta'
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
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const PopoverPage = () => {
  return (
    <DocsPageLayout
      title='Popover'
      description='Displays rich content in a portal, triggered by a button. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple popover with content'>
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
      </DocsSection>

      <DocsSection id='with-form' title='With Form' description='Popover with form fields'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'

export function ColorPicker() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-48 justify-start">
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
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='components'
          rows={[
            {
              name: 'Popover',
              description: 'Root popover component'
            },
            {
              name: 'PopoverTrigger',
              description: 'Trigger button for popover'
            },
            {
              name: 'PopoverContent',
              description: 'Content container for popover'
            }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default PopoverPage
