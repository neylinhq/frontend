import { useTranslation } from 'react-i18next'
import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { Label } from '@/shared/ui/label'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/checkbox'

export const handle = {
  breadcrumb: 'Checkbox'
}

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

export default function CheckboxPage() {
  const { t } = useTranslation()

  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: t('docs.common.basic'), level: 2 },
    { id: 'with-label', title: t('docs.common.withLabel'), level: 2 },
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
              { label: 'Checkbox' }
            ]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Checkbox</Typography>
            <Badge variant='brand'>{t('docs.common.component')}</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            {t('docs.checkbox.lead')}
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.basic')}</Typography>
          <Typography variant='muted'>{t('docs.checkbox.basic.description')}</Typography>

          <DocsComponentPreview code={`<Checkbox />`}>
            <DocsPreview>
              <Checkbox />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-label' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.withLabel')}</Typography>
          <Typography variant='muted'>{t('docs.checkbox.withLabel.description')}</Typography>

          <DocsComponentPreview
            code={`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">${t('docs.checkbox.withLabel.acceptTerms')}</Label>
</div>`}
          >
            <DocsPreview>
              <div className='flex items-center space-x-2'>
                <Checkbox id='terms' />
                <Label htmlFor='terms'>{t('docs.checkbox.withLabel.acceptTerms')}</Label>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='states' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.states')}</Typography>
          <Typography variant='muted'>{t('docs.checkbox.states.description')}</Typography>

          <DocsComponentPreview
            code={`<Checkbox defaultChecked />
<Checkbox disabled />
<Checkbox disabled defaultChecked />`}
          >
            <DocsPreview className='flex gap-6'>
              <div className='flex items-center space-x-2'>
                <Checkbox id='checked' defaultChecked />
                <Label htmlFor='checked'>{t('docs.checkbox.states.checked')}</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox id='disabled' disabled />
                <Label htmlFor='disabled' className='text-muted-foreground'>
                  {t('docs.checkbox.states.disabled')}
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox id='disabled-checked' disabled defaultChecked />
                <Label htmlFor='disabled-checked' className='text-muted-foreground'>
                  {t('docs.checkbox.states.disabledChecked')}
                </Label>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.usage')}</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'

export function RememberMe() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Label htmlFor="remember">${t('docs.checkbox.usage.rememberMe')}</Label>
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
                    <code className='text-sm font-semibold text-brand'>checked</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>boolean</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>-</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>onCheckedChange</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      (checked: boolean) =&gt; void
                    </code>
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
