import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/tabs'

export const handle = {
  breadcrumb: 'Tabs'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const TabsPage = () => {
  return (
    <DocsPageLayout
      title='Tabs'
      description='A set of layered sections of content. Built with Radix UI for accessibility.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple tab navigation with content panels'>
        <DocsComponentPreview
          code={`<Tabs defaultValue="account" className="w-96">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Account settings content here.
  </TabsContent>
  <TabsContent value="password">
    Password settings content here.
  </TabsContent>
</Tabs>`}
        >
          <DocsPreview>
            <Tabs defaultValue='account' className='w-96'>
              <TabsList>
                <TabsTrigger value='account'>Account</TabsTrigger>
                <TabsTrigger value='password'>Password</TabsTrigger>
              </TabsList>
              <TabsContent value='account' className='p-4 border rounded-lg mt-2'>
                <Typography variant='p'>
                  Make changes to your account here. Click save when you're done.
                </Typography>
              </TabsContent>
              <TabsContent value='password' className='p-4 border rounded-lg mt-2'>
                <Typography variant='p'>
                  Change your password here. After saving, you'll be logged out.
                </Typography>
              </TabsContent>
            </Tabs>
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'

export function SettingsTabs() {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <GeneralSettings />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>
    </Tabs>
  )
}`}
        />
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='components'
          rows={[
            {
              name: 'Tabs',
              description: 'Root with defaultValue prop'
            },
            {
              name: 'TabsList',
              description: 'Container for tab triggers'
            },
            {
              name: 'TabsTrigger',
              description: 'Button with value prop'
            },
            {
              name: 'TabsContent',
              description: 'Content panel with value prop'
            }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default TabsPage
