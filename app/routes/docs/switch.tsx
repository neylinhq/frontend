import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { Switch } from '@/shared/components/switch'
import { getMeta } from '@/shared/lib/get-meta'
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
    <DocsPageLayout
      title='Switch'
      description='A toggle switch for boolean settings. Built with Radix UI for accessibility.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple toggle switch'>
        <DocsComponentPreview code={`<Switch />`}>
          <DocsPreview>
            <Switch />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-label' title='With Label' description='Switch with associated label'>
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
      </DocsSection>

      <DocsSection id='states' title='States' description='Checked and disabled states'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
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
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='props'
          rows={[
            {
              name: 'checked',
              type: 'boolean',
              defaultValue: '-'
            },
            {
              name: 'onCheckedChange',
              type: '(checked: boolean) => void',
              defaultValue: '-'
            },
            {
              name: 'disabled',
              type: 'boolean',
              defaultValue: 'false'
            }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default SwitchPage
