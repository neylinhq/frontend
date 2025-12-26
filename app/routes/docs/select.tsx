import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/select'

export const handle = {
  breadcrumb: 'Select'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-label', title: 'With Label', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const SelectPage = () => {
  return (
    <DocsPageLayout
      title='Select'
      description='A dropdown select component for choosing from a list of options. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple select dropdown'>
        <DocsComponentPreview
          code={`<Select>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>`}
        >
          <DocsPreview>
            <Select>
              <SelectTrigger className='w-44'>
                <SelectValue placeholder='Select a fruit' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='apple'>Apple</SelectItem>
                <SelectItem value='banana'>Banana</SelectItem>
                <SelectItem value='orange'>Orange</SelectItem>
              </SelectContent>
            </Select>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='with-label' title='With Label' description='Select with associated label'>
        <DocsComponentPreview
          code={`<div className="space-y-2">
  <Label>Theme</Label>
  <Select defaultValue="system">
    <SelectTrigger className="w-48">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="light">Light</SelectItem>
      <SelectItem value="dark">Dark</SelectItem>
      <SelectItem value="system">System</SelectItem>
    </SelectContent>
  </Select>
</div>`}
        >
          <DocsPreview>
            <div className='space-y-2'>
              <Label>Theme</Label>
              <Select defaultValue='system'>
                <SelectTrigger className='w-48'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='light'>Light</SelectItem>
                  <SelectItem value='dark'>Dark</SelectItem>
                  <SelectItem value='system'>System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'

export function ThemeSelect() {
  const [theme, setTheme] = useState('system')

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  )
}`}
        />
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='components'
          rows={[
            {
              name: 'Select',
              description: 'Root with value/onValueChange'
            },
            {
              name: 'SelectTrigger',
              description: 'Button that opens dropdown'
            },
            {
              name: 'SelectValue',
              description: 'Displays selected value'
            },
            {
              name: 'SelectContent',
              description: 'Dropdown container'
            },
            {
              name: 'SelectItem',
              description: 'Option with value prop'
            }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default SelectPage
