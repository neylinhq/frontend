import { Badge } from '@/shared/components/badge'
import { Checkbox } from '@/shared/components/checkbox'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/checkbox'

export const handle = {
  breadcrumb: 'Checkbox'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const CheckboxPage = () => {
  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: 'Basic', level: 2 },
    { id: 'with-label', title: 'With Label', level: 2 },
    { id: 'states', title: 'States', level: 2 },
    { id: 'usage', title: 'Usage', level: 2 },
    { id: 'api-reference', title: 'API Reference', level: 2 }
  ]
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Checkbox' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Checkbox</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Checkbox for binary choice selection. Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <p className='text-xs text-muted-foreground'>Simple checkbox</p>

          <DocsComponentPreview code={`<Checkbox />`}>
            <DocsPreview>
              <Checkbox />
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-label' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Label</Typography>
          <p className='text-xs text-muted-foreground'>Checkbox with associated label</p>

          <DocsComponentPreview
            code={`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>`}
          >
            <DocsPreview>
              <div className='flex items-center space-x-2'>
                <Checkbox id='terms' />
                <Label htmlFor='terms'>Accept terms and conditions</Label>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='states' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>States</Typography>
          <p className='text-xs text-muted-foreground'>Different checkbox states</p>

          <DocsComponentPreview
            code={`<Checkbox defaultChecked />
<Checkbox disabled />
<Checkbox disabled defaultChecked />`}
          >
            <DocsPreview className='flex gap-6'>
              <div className='flex items-center space-x-2'>
                <Checkbox id='checked' defaultChecked />
                <Label htmlFor='checked'>Checked</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox id='disabled' disabled />
                <Label htmlFor='disabled' className='text-muted-foreground'>
                  Disabled
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox id='disabled-checked' disabled defaultChecked />
                <Label htmlFor='disabled-checked' className='text-muted-foreground'>
                  Disabled Checked
                </Label>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Checkbox } from '@/shared/components/checkbox'
import { Label } from '@/shared/components/label'

export function RememberMe() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Label htmlFor="remember">Remember me</Label>
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

export default CheckboxPage
