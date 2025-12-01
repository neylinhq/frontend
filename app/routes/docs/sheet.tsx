import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
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
import { Typography } from '@/shared/components/typography'
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
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Sheet' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Sheet</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            A panel that slides out from the edge of the screen. Built with Radix UI Dialog.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
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
        </section>

        <section id='sides' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Sides</Typography>
          <Typography variant='muted'>
            Sheet can appear from different sides using the side prop.
          </Typography>
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
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
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
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default SheetPage
