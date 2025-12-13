import { Checkbox } from '@/shared/components/checkbox'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/checkbox'

export const handle = {
  breadcrumb: 'Checkbox'
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

const CheckboxPage = () => {
  return (
    <DocsPageLayout
      title='Checkbox'
      description='Checkbox for binary choice selection. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple checkbox'>
        <DocsComponentPreview code={`<Checkbox />`}>
          <DocsPreview>
            <Checkbox />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-label' title='With Label' description='Checkbox with associated label'>
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
      </DocsSection>

      <DocsSection id='states' title='States' description='Different checkbox states'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
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
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='props'
          rows={[
            { name: 'checked', type: 'boolean', defaultValue: '-' },
            { name: 'onCheckedChange', type: '(checked: boolean) => void', defaultValue: '-' },
            { name: 'disabled', type: 'boolean', defaultValue: 'false' }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default CheckboxPage
