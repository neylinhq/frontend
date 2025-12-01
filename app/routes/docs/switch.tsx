import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { Switch } from '@/shared/components/switch'
import { Typography } from '@/shared/components/typography'
import type { Route } from './+types/switch'

export const handle = {
  breadcrumb: 'Switch'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-label', title: 'With Label', level: 2 },
  { id: 'states', title: 'States', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const SwitchPage = () => {
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Switch' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Switch</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            A toggle switch for boolean settings. Built with Radix UI for accessibility.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <Typography variant='muted'>Simple toggle switch.</Typography>

          <DocsComponentPreview code={`<Switch />`}>
            <DocsPreview>
              <Switch />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-label' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Label</Typography>
          <Typography variant='muted'>Switch with associated label for better UX.</Typography>

          <DocsComponentPreview
            code={`<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>`}
          >
            <DocsPreview>
              <div className='flex items-center space-x-2'>
                <Switch id='airplane-mode' />
                <Label htmlFor='airplane-mode'>Airplane Mode</Label>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='states' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>States</Typography>
          <Typography variant='muted'>Checked and disabled states.</Typography>

          <DocsComponentPreview
            code={`<Switch defaultChecked />
<Switch disabled />
<Switch disabled defaultChecked />`}
          >
            <DocsPreview className='flex gap-6'>
              <div className='flex items-center space-x-2'>
                <Switch id='checked' defaultChecked />
                <Label htmlFor='checked'>On</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch id='disabled' disabled />
                <Label htmlFor='disabled' className='text-muted-foreground'>
                  Disabled
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch id='disabled-checked' disabled defaultChecked />
                <Label htmlFor='disabled-checked' className='text-muted-foreground'>
                  Disabled on
                </Label>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Switch } from '@/shared/components/switch'
import { Label } from '@/shared/components/label'

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(true)

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="notifications"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <Label htmlFor="notifications">Enable notifications</Label>
    </div>
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
                  <th className='text-left px-4 py-3 font-medium'>Prop</th>
                  <th className='text-left px-4 py-3 font-medium'>Type</th>
                  <th className='text-left px-4 py-3 font-medium'>Default</th>
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

export default SwitchPage
