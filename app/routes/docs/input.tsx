import { useTranslation } from 'react-i18next'
import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/ui/badge'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/input'

export const handle = {
  breadcrumb: 'Input'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const InputPage = () => {
  const { t } = useTranslation()

  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: t('docs.common.basic'), level: 2 },
    { id: 'with-label', title: t('docs.common.withLabel'), level: 2 },
    { id: 'types', title: t('docs.common.types'), level: 2 },
    { id: 'states', title: t('docs.common.states'), level: 2 },
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
              { label: 'Input' }
            ]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Input</Typography>
            <Badge variant='brand'>{t('docs.common.component')}</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            {t('docs.input.lead')}
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.basic')}</Typography>
          <Typography variant='muted'>{t('docs.input.basic.description')}</Typography>

          <DocsComponentPreview
            code={`<Input placeholder="${t('docs.input.basic.placeholder')}" />`}
          >
            <DocsPreview>
              <Input placeholder={t('docs.input.basic.placeholder')} className='max-w-sm' />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-label' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.withLabel')}</Typography>
          <Typography variant='muted'>{t('docs.input.withLabel.description')}</Typography>

          <DocsComponentPreview
            code={`<div className="space-y-2">
  <Label htmlFor="email">${t('docs.input.withLabel.emailLabel')}</Label>
  <Input id="email" type="email" placeholder="${t('docs.input.withLabel.emailPlaceholder')}" />
</div>`}
          >
            <DocsPreview>
              <div className='space-y-2 w-full max-w-sm'>
                <Label htmlFor='email'>{t('docs.input.withLabel.emailLabel')}</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder={t('docs.input.withLabel.emailPlaceholder')}
                />
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='types' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.types')}</Typography>
          <Typography variant='muted'>{t('docs.input.types.description')}</Typography>

          <DocsComponentPreview
            code={`<Input type="text" placeholder="${t('docs.input.types.text')}" />
<Input type="email" placeholder="${t('docs.input.types.email')}" />
<Input type="password" placeholder="${t('docs.input.types.password')}" />
<Input type="number" placeholder="${t('docs.input.types.number')}" />`}
          >
            <DocsPreview className='flex flex-col gap-4 w-full max-w-sm'>
              <Input type='text' placeholder={t('docs.input.types.text')} />
              <Input type='email' placeholder={t('docs.input.types.email')} />
              <Input type='password' placeholder={t('docs.input.types.password')} />
              <Input type='number' placeholder={t('docs.input.types.number')} />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='states' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.states')}</Typography>
          <Typography variant='muted'>{t('docs.input.states.description')}</Typography>

          <DocsComponentPreview
            code={`<Input disabled placeholder="${t('docs.input.states.disabledPlaceholder')}" />`}
          >
            <DocsPreview>
              <Input
                disabled
                placeholder={t('docs.input.states.disabledPlaceholder')}
                className='max-w-sm'
              />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.usage')}</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function MyForm() {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">${t('docs.input.usage.nameLabel')}</Label>
      <Input
        id="name"
        placeholder="${t('docs.input.usage.namePlaceholder')}"
        onChange={(e) => console.log(e.target.value)}
      />
    </div>
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
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.prop')}</th>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.type')}</th>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.default')}</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>type</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>'text'</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>placeholder</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>-</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>disabled</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>boolean</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>false</code>
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

export default InputPage
