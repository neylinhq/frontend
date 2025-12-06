import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/shared/components/alert-dialog'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/alert-dialog'

export const handle = {
  breadcrumb: 'Alert Dialog'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const AlertDialogPage = () => {
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Alert Dialog' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Alert Dialog</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            A modal dialog that interrupts the user with important content and expects a response.
            Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <Typography variant='muted'>
            Use for destructive actions that require confirmation.
          </Typography>

          <DocsComponentPreview
            code={`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your
        account and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
          >
            <DocsPreview>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive'>Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and
                      remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
          <DocsCodeBlock
            language='tsx'
            code={`import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/alert-dialog'

export function DeleteConfirmation({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}`}
          />
        </section>

        <section id='api-reference' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>API Reference</Typography>
          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>Component</th>
                  <th className='text-left px-4 py-3 font-medium'>Description</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>AlertDialog</code>
                  </td>
                  <td className='px-4 py-3'>Root component</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>AlertDialogTrigger</code>
                  </td>
                  <td className='px-4 py-3'>Opens the dialog</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>AlertDialogContent</code>
                  </td>
                  <td className='px-4 py-3'>Modal content</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>AlertDialogAction</code>
                  </td>
                  <td className='px-4 py-3'>Confirm action button</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>AlertDialogCancel</code>
                  </td>
                  <td className='px-4 py-3'>Cancel button</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default AlertDialogPage
