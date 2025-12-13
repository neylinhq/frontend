import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/radio-group'

export const handle = {
  breadcrumb: 'Radio Group'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const RadioGroupPage = () => {
  return (
    <DocsPageLayout
      title='Radio Group'
      description='A set of checkable buttons where only one can be checked at a time. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Basic radio group with options'>
        <DocsComponentPreview
          code={`<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>`}
        >
          <DocsPreview>
            <RadioGroup defaultValue='option-one'>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='option-one' id='option-one' />
                <Label htmlFor='option-one'>Option One</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='option-two' id='option-two' />
                <Label htmlFor='option-two'>Option Two</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='option-three' id='option-three' />
                <Label htmlFor='option-three'>Option Three</Label>
              </div>
            </RadioGroup>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group'
import { Label } from '@/shared/components/label'

export function ThemeSelector() {
  const [theme, setTheme] = useState('system')

  return (
    <RadioGroup value={theme} onValueChange={setTheme}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="light" id="light" />
        <Label htmlFor="light">Light</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="dark" id="dark" />
        <Label htmlFor="dark">Dark</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="system" id="system" />
        <Label htmlFor="system">System</Label>
      </div>
    </RadioGroup>
  )
}`}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default RadioGroupPage
