'use client'

import { useTranslation } from 'react-i18next'
import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/components/badge'
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
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Typography } from '@/shared/components/typography'
import type { Route } from './+types/dialog'

export const handle = {
  breadcrumb: 'Dialog'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const DialogPage = () => {
  const { t } = useTranslation()

  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: t('docs.common.basic'), level: 2 },
    { id: 'with-form', title: t('docs.dialog.withForm.title'), level: 2 },
    { id: 'usage', title: t('docs.common.usage'), level: 2 },
    { id: 'api-reference', title: t('docs.common.apiReference'), level: 2 }
  ]

  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[
              { label: t('docs.common.components'), href: '/docs/ui/button' },
              { label: 'Dialog' }
            ]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Dialog</Typography>
            <Badge variant='brand'>{t('docs.common.component')}</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            {t('docs.dialog.lead')}
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.basic')}</Typography>
          <Typography variant='muted'>{t('docs.dialog.basic.sectionDescription')}</Typography>

          <DocsComponentPreview
            code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">${t('docs.dialog.basic.openDialog')}</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>${t('docs.dialog.basic.title')}</DialogTitle>
      <DialogDescription>
        ${t('docs.dialog.basic.description')}
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
          >
            <DocsPreview>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline'>{t('docs.dialog.basic.openDialog')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('docs.dialog.basic.title')}</DialogTitle>
                    <DialogDescription>{t('docs.dialog.basic.description')}</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-form' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.dialog.withForm.title')}</Typography>
          <Typography variant='muted'>{t('docs.dialog.withForm.description')}</Typography>

          <DocsComponentPreview
            code={`<Dialog>
  <DialogTrigger asChild>
    <Button>${t('docs.dialog.withForm.editProfile')}</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>${t('docs.dialog.withForm.editProfileTitle')}</DialogTitle>
      <DialogDescription>
        ${t('docs.dialog.withForm.editProfileDescription')}
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">${t('docs.dialog.withForm.nameLabel')}</Label>
        <Input id="name" defaultValue="${t('docs.dialog.withForm.nameValue')}" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">${t('docs.dialog.withForm.emailLabel')}</Label>
        <Input id="email" defaultValue="${t('docs.dialog.withForm.emailValue')}" />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">${t('docs.dialog.withForm.saveChanges')}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
          >
            <DocsPreview>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>{t('docs.dialog.withForm.editProfile')}</Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[425px]'>
                  <DialogHeader>
                    <DialogTitle>{t('docs.dialog.withForm.editProfileTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('docs.dialog.withForm.editProfileDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className='grid gap-4 py-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='name'>{t('docs.dialog.withForm.nameLabel')}</Label>
                      <Input id='name' defaultValue={t('docs.dialog.withForm.nameValue')} />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>{t('docs.dialog.withForm.emailLabel')}</Label>
                      <Input id='email' defaultValue={t('docs.dialog.withForm.emailValue')} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type='submit'>{t('docs.dialog.withForm.saveChanges')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.usage')}</Typography>

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
        </section>

        <section id='api-reference' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.apiReference')}</Typography>

          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.component')}</th>
                  <th className='text-left px-4 py-3 font-medium'>
                    {t('docs.common.description')}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>Dialog</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      {t('docs.dialog.api.dialogDescription')}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>DialogTrigger</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      {t('docs.dialog.api.triggerDescription')}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>DialogContent</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      {t('docs.dialog.api.contentDescription')}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>DialogHeader</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      {t('docs.dialog.api.headerDescription')}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>DialogFooter</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      {t('docs.dialog.api.footerDescription')}
                    </code>
                  </td>
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

export default DialogPage
