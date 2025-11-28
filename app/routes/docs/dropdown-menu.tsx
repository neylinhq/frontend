import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Typography } from '@/shared/ui/typography'
import { Badge } from '@/shared/ui/badge'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/dropdown-menu'

export const handle = {
  breadcrumb: 'Dropdown Menu',
}

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 },
]

export default function DropdownMenuPage() {
  return (
    <div className="flex gap-10">
      <div className="flex-1 min-w-0 space-y-10">
        <header className="space-y-4">
          <DocsBreadcrumbs
            items={[
              { label: 'Components', href: '/docs/ui/button' },
              { label: 'Dropdown Menu' },
            ]}
          />
          <div className="flex items-center gap-3">
            <Typography variant="h1">Dropdown Menu</Typography>
            <Badge variant="brand">Component</Badge>
          </div>
          <Typography variant="lead" className="max-w-2xl">
            Displays a menu of actions triggered by a button. Built with Radix UI.
          </Typography>
        </header>

        <section id="basic" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">Basic</Typography>
          <DocsComponentPreview
            code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
          >
            <DocsPreview>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id="usage" className="scroll-mt-20 space-y-4 pt-6 border-t">
          <Typography variant="h2">Usage</Typography>
          <DocsCodeBlock
            language="tsx"
            code={`import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`}
          />
        </section>

        <section id="api-reference" className="scroll-mt-20 space-y-4 pt-6 border-t">
          <Typography variant="h2">API Reference</Typography>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Component</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DropdownMenu</code></td>
                  <td className="px-4 py-3">Root component</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DropdownMenuTrigger</code></td>
                  <td className="px-4 py-3">Button that toggles menu</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DropdownMenuContent</code></td>
                  <td className="px-4 py-3">Menu container with align prop</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DropdownMenuItem</code></td>
                  <td className="px-4 py-3">Clickable menu item</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DropdownMenuSeparator</code></td>
                  <td className="px-4 py-3">Visual separator</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className="hidden xl:block" />
    </div>
  )
}
