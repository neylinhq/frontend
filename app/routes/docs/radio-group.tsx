import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Label } from '@/shared/components/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group'
import { Typography } from '@/shared/components/typography'
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
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Radio Group' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Radio Group</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            A set of checkable buttons where only one can be checked at a time. Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
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
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
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
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default RadioGroupPage
