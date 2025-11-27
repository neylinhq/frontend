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
      { title: 'Introduction', href: '/public/ui' },
      { title: 'Colors', href: '/public/ui/colors' },
      { title: 'Typography', href: '/public/ui/typography' },
    ],
  },
  {
    title: 'Components',
    icon: Package,
    defaultOpen: true,
    items: [
      { title: 'Alert Dialog', href: '/public/ui/alert-dialog' },
      { title: 'Avatar', href: '/public/ui/avatar' },
      { title: 'Badge', href: '/public/ui/badge' },
      { title: 'Button', href: '/public/ui/button' },
      { title: 'Card', href: '/public/ui/card' },
      { title: 'Checkbox', href: '/public/ui/checkbox' },
      { title: 'Collapsible', href: '/public/ui/collapsible' },
      { title: 'Context Menu', href: '/public/ui/context-menu' },
      { title: 'Dialog', href: '/public/ui/dialog' },
      { title: 'Drawer', href: '/public/ui/drawer' },
      { title: 'Dropdown Menu', href: '/public/ui/dropdown-menu' },
      { title: 'Form', href: '/public/ui/form' },
      { title: 'Input', href: '/public/ui/input' },
      { title: 'Label', href: '/public/ui/label' },
      { title: 'Popover', href: '/public/ui/popover' },
      { title: 'Progress', href: '/public/ui/progress' },
      { title: 'Radio Group', href: '/public/ui/radio-group' },
      { title: 'Select', href: '/public/ui/select' },
      { title: 'Separator', href: '/public/ui/separator' },
      { title: 'Sheet', href: '/public/ui/sheet' },
      { title: 'Slider', href: '/public/ui/slider' },
      { title: 'Switch', href: '/public/ui/switch' },
      { title: 'Table', href: '/public/ui/table' },
      { title: 'Tabs', href: '/public/ui/tabs' },
      { title: 'Textarea', href: '/public/ui/textarea' },
    ],
  },
]

export default function UiLayout() {
  const sidebar = <DocsSidebar sections={NAV_SECTIONS} />

  return (
    <DocsLayout sidebar={sidebar}>
      <div className="docs-page-enter">
        <Outlet />
      </div>
    </DocsLayout>
  )
}
