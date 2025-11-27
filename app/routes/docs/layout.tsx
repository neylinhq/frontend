import { Outlet } from 'react-router'
import { BookOpen, Package } from 'lucide-react'
import { DocsLayout } from '@/shared/ui/docs-layout'
import { DocsSidebar, type DocsSidebarSection } from '@/shared/ui/docs-sidebar'

// Bypass PublicLayout - DocsLayout handles its own header
export const handle = {
  bypassPublicLayout: true,
}

// Navigation structure with icons
const NAV_SECTIONS: DocsSidebarSection[] = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    defaultOpen: true,
    items: [
      { title: 'Introduction', href: '/docs/ui' },
      { title: 'Colors', href: '/docs/ui/colors' },
      { title: 'Typography', href: '/docs/ui/typography' },
    ],
  },
  {
    title: 'Components',
    icon: Package,
    defaultOpen: true,
    items: [
      { title: 'Alert Dialog', href: '/docs/ui/alert-dialog' },
      { title: 'Avatar', href: '/docs/ui/avatar' },
      { title: 'Badge', href: '/docs/ui/badge' },
      { title: 'Button', href: '/docs/ui/button' },
      { title: 'Card', href: '/docs/ui/card' },
      { title: 'Checkbox', href: '/docs/ui/checkbox' },
      { title: 'Collapsible', href: '/docs/ui/collapsible' },
      { title: 'Context Menu', href: '/docs/ui/context-menu' },
      { title: 'Dialog', href: '/docs/ui/dialog' },
      { title: 'Drawer', href: '/docs/ui/drawer' },
      { title: 'Dropdown Menu', href: '/docs/ui/dropdown-menu' },
      { title: 'Form', href: '/docs/ui/form' },
      { title: 'Input', href: '/docs/ui/input' },
      { title: 'Label', href: '/docs/ui/label' },
      { title: 'Popover', href: '/docs/ui/popover' },
      { title: 'Progress', href: '/docs/ui/progress' },
      { title: 'Radio Group', href: '/docs/ui/radio-group' },
      { title: 'Select', href: '/docs/ui/select' },
      { title: 'Separator', href: '/docs/ui/separator' },
      { title: 'Sheet', href: '/docs/ui/sheet' },
      { title: 'Slider', href: '/docs/ui/slider' },
      { title: 'Switch', href: '/docs/ui/switch' },
      { title: 'Table', href: '/docs/ui/table' },
      { title: 'Tabs', href: '/docs/ui/tabs' },
      { title: 'Textarea', href: '/docs/ui/textarea' },
    ],
  },
]

export default function UiLayout() {
  const sidebar = <DocsSidebar sections={NAV_SECTIONS} />

  return (
    <DocsLayout sidebar={sidebar}>
      <Outlet />
    </DocsLayout>
  )
}
