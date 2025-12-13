'use client'

import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/dialog'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/dialog'

export const handle = {
  breadcrumb: 'Dialog'
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

const DialogPage = () => {
  return (
    <DocsPageLayout
      title='Dialog'
      description='Modal dialog for displaying content over the main page. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple dialog with title and description'>
        <DocsComponentPreview
          code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Please confirm.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
        >
          <DocsPreview>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline'>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Please confirm.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-form' title='With Form' description='Dialog containing a form'>
        <DocsComponentPreview
          code={`<Dialog>
  <DialogTrigger asChild>
    <Button>Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" defaultValue="John Doe" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" defaultValue="john@example.com" />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        >
          <DocsPreview>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>Make changes to your profile here.</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Name</Label>
                    <Input id='name' defaultValue='John Doe' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input id='email' defaultValue='john@example.com' />
                  </div>
                </div>
                <DialogFooter>
                  <Button type='submit'>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/dialog'

export function ConfirmDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => {
            // Handle delete
            setOpen(false)
          }}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`}
        />
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='component'
          rows={[
            { name: 'Dialog', description: 'Root with open/onOpenChange props' },
            { name: 'DialogTrigger', description: 'Button that opens the dialog' },
            { name: 'DialogContent', description: 'Dialog modal container' },
            { name: 'DialogHeader', description: 'Header section' },
            { name: 'DialogFooter', description: 'Footer for action buttons' }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default DialogPage
