import { Button } from '@/shared/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer'
import { Typography } from '@/shared/ui/typography'
import { Badge } from '@/shared/ui/badge'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/drawer'

export const handle = {
  breadcrumb: 'Drawer',
}

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 },
]

export default function DrawerPage() {
  return (
    <div className="flex gap-10">
      <div className="flex-1 min-w-0 space-y-10">
        <header className="space-y-4">
          <DocsBreadcrumbs
            items={[
              { label: 'Components', href: '/docs/ui/button' },
              { label: 'Drawer' },
            ]}
          />
          <div className="flex items-center gap-3">
            <Typography variant="h1">Drawer</Typography>
            <Badge variant="brand">Component</Badge>
          </div>
          <Typography variant="lead" className="max-w-2xl">
            A draggable dialog that slides in from the edge of the screen. Built with Vaul.
          </Typography>
        </header>

        <section id="basic" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">Basic</Typography>
          <DocsComponentPreview
            code={`<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description here.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`}
          >
            <DocsPreview>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                      <DrawerTitle>Move Goal</DrawerTitle>
                      <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex-1 text-center">
                          <div className="text-7xl font-bold tracking-tighter">350</div>
                          <div className="text-muted-foreground">Calories/day</div>
                        </div>
                      </div>
                    </div>
                    <DrawerFooter>
                      <Button>Submit</Button>
                      <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id="usage" className="scroll-mt-20 space-y-4 pt-6 border-t">
          <Typography variant="h2">Usage</Typography>
          <DocsCodeBlock
            language="tsx"
            code={`import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer'

export function MobileMenu() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        <nav className="p-4 space-y-2">
          <a href="/home" className="block p-2">Home</a>
          <a href="/about" className="block p-2">About</a>
          <a href="/contact" className="block p-2">Contact</a>
        </nav>
      </DrawerContent>
    </Drawer>
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
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">Drawer</code></td>
                  <td className="px-4 py-3">Root component</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DrawerTrigger</code></td>
                  <td className="px-4 py-3">Button that opens drawer</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DrawerContent</code></td>
                  <td className="px-4 py-3">Drawer panel</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-semibold text-brand">DrawerClose</code></td>
                  <td className="px-4 py-3">Closes the drawer</td>
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
