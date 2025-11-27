import { Outlet } from 'react-router'
import { BookOpen, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DocsLayout } from '@/shared/ui/docs-layout'
import { DocsSidebar, type DocsSidebarSection } from '@/shared/ui/docs-sidebar'

// Bypass PublicLayout - DocsLayout handles its own header
export const handle = {
  bypassPublicLayout: true,
}

export default function UiLayout() {
  const { t } = useTranslation()

  // Navigation structure with icons
  const NAV_SECTIONS: DocsSidebarSection[] = [
    {
      title: t('docs.nav.gettingStarted'),
      icon: BookOpen,
      defaultOpen: true,
      items: [
        { title: t('docs.nav.introduction'), href: '/docs/ui' },
        { title: t('docs.nav.colors'), href: '/docs/ui/colors' },
        { title: t('docs.nav.typography'), href: '/docs/ui/typography' },
      ],
    },
    {
      title: t('docs.nav.components'),
      icon: Package,
      defaultOpen: true,
      items: [
        { title: t('docs.componentNames.alertDialog'), href: '/docs/ui/alert-dialog' },
        { title: t('docs.componentNames.avatar'), href: '/docs/ui/avatar' },
        { title: t('docs.componentNames.badge'), href: '/docs/ui/badge' },
        { title: t('docs.componentNames.button'), href: '/docs/ui/button' },
        { title: t('docs.componentNames.card'), href: '/docs/ui/card' },
        { title: t('docs.componentNames.checkbox'), href: '/docs/ui/checkbox' },
        { title: t('docs.componentNames.collapsible'), href: '/docs/ui/collapsible' },
        { title: t('docs.componentNames.contextMenu'), href: '/docs/ui/context-menu' },
        { title: t('docs.componentNames.dialog'), href: '/docs/ui/dialog' },
        { title: t('docs.componentNames.drawer'), href: '/docs/ui/drawer' },
        { title: t('docs.componentNames.dropdownMenu'), href: '/docs/ui/dropdown-menu' },
        { title: t('docs.componentNames.form'), href: '/docs/ui/form' },
        { title: t('docs.componentNames.input'), href: '/docs/ui/input' },
        { title: t('docs.componentNames.label'), href: '/docs/ui/label' },
        { title: t('docs.componentNames.popover'), href: '/docs/ui/popover' },
        { title: t('docs.componentNames.progress'), href: '/docs/ui/progress' },
        { title: t('docs.componentNames.radioGroup'), href: '/docs/ui/radio-group' },
        { title: t('docs.componentNames.select'), href: '/docs/ui/select' },
        { title: t('docs.componentNames.separator'), href: '/docs/ui/separator' },
        { title: t('docs.componentNames.sheet'), href: '/docs/ui/sheet' },
        { title: t('docs.componentNames.slider'), href: '/docs/ui/slider' },
        { title: t('docs.componentNames.switch'), href: '/docs/ui/switch' },
        { title: t('docs.componentNames.table'), href: '/docs/ui/table' },
        { title: t('docs.componentNames.tabs'), href: '/docs/ui/tabs' },
        { title: t('docs.componentNames.textarea'), href: '/docs/ui/textarea' },
      ],
    },
  ]

  const sidebar = <DocsSidebar sections={NAV_SECTIONS} />

  return (
    <DocsLayout sidebar={sidebar}>
      <Outlet />
    </DocsLayout>
  )
}
