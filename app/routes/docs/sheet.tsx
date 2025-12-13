import { Button } from '@/shared/components/button'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shared/components/sheet'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/sheet'

export const handle = {
  breadcrumb: 'Sheet'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'sides', title: 'Sides', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const SheetPage = () => {
  return (
    <DocsPageLayout
      title='Sheet'
      description='A panel that slides out from the edge of the screen. Built with Radix UI Dialog.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Basic sheet panel'>
        <DocsComponentPreview
          code={`<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here.
      </SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value="John Doe" />
      </div>
    </div>
    <SheetFooter>
      <SheetClose asChild>
        <Button type="submit">Save changes</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`}
        >
          <DocsPreview>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline'>Open Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>
                    Make changes to your profile here. Click save when you're done.
                  </SheetDescription>
                </SheetHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Name</Label>
                    <Input id='name' defaultValue='John Doe' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='username'>Username</Label>
                    <Input id='username' defaultValue='@johndoe' />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type='submit'>Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='sides' title='Sides' description='Sheet from different sides'>
        <DocsComponentPreview
          code={`<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Left</Button>
  </SheetTrigger>
  <SheetContent side="left">...</SheetContent>
</Sheet>`}
        >
          <DocsPreview className='flex gap-4'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline'>Left</Button>
              </SheetTrigger>
              <SheetContent side='left'>
                <SheetHeader>
                  <SheetTitle>Left Sheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline'>Right</Button>
              </SheetTrigger>
              <SheetContent side='right'>
                <SheetHeader>
                  <SheetTitle>Right Sheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline'>Top</Button>
              </SheetTrigger>
              <SheetContent side='top'>
                <SheetHeader>
                  <SheetTitle>Top Sheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline'>Bottom</Button>
              </SheetTrigger>
              <SheetContent side='bottom'>
                <SheetHeader>
                  <SheetTitle>Bottom Sheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/sheet'

export function SettingsPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your application settings.
          </SheetDescription>
        </SheetHeader>
        <SettingsForm />
      </SheetContent>
    </Sheet>
  )
}`}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default SheetPage
