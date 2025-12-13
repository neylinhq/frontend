import { Button } from '@/shared/components/button'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/shared/components/drawer'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/drawer'

export const handle = {
  breadcrumb: 'Drawer'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const DrawerPage = () => {
  return (
    <DocsPageLayout
      title='Drawer'
      description='A draggable dialog that slides in from the edge of the screen. Built with Vaul.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic'>
        <DocsComponentPreview
          code={`<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description here.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`}
        >
          <DocsPreview>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant='outline'>Open Drawer</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-sm'>
                  <DrawerHeader>
                    <DrawerTitle>Move Goal</DrawerTitle>
                    <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                  </DrawerHeader>
                  <div className='p-4'>
                    <div className='flex items-center justify-center space-x-2'>
                      <div className='flex-1 text-center'>
                        <div className='text-7xl font-bold tracking-tighter'>350</div>
                        <div className='text-muted-foreground'>Calories/day</div>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button>Submit</Button>
                    <DrawerClose asChild>
                      <Button variant='outline'>Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/drawer'

export function MobileMenu() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        <nav className="p-4 space-y-2">
          <a href="/home" className="block p-2">Home</a>
          <a href="/about" className="block p-2">About</a>
          <a href="/contact" className="block p-2">Contact</a>
        </nav>
      </DrawerContent>
    </Drawer>
  )
}`}
        />
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='component'
          rows={[
            { name: 'Drawer', description: 'Root component' },
            { name: 'DrawerTrigger', description: 'Button that opens drawer' },
            { name: 'DrawerContent', description: 'Drawer panel' },
            { name: 'DrawerClose', description: 'Closes the drawer' }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default DrawerPage
