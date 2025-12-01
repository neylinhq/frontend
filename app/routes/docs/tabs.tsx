import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { Typography } from '@/shared/components/typography'
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
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Tabs' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Tabs</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            A set of layered sections of content. Built with Radix UI for accessibility.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <Typography variant='muted'>Simple tab navigation with content panels.</Typography>

          <DocsComponentPreview
            code={`<Tabs defaultValue="account" className="w-[400px]">
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
              <Tabs defaultValue='account' className='w-[400px]'>
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
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>

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
        </section>

        <section id='api-reference' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>API Reference</Typography>

          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>Component</th>
                  <th className='text-left px-4 py-3 font-medium'>Description</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>Tabs</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      Root with defaultValue prop
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TabsList</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      Container for tab triggers
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TabsTrigger</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>Button with value prop</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TabsContent</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      Content panel with value prop
                    </code>
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

export default TabsPage
