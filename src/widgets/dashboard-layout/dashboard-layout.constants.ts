import { Beaker, BookOpen, LayoutDashboard, type LucideIcon, Network } from 'lucide-react'

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon
}

export const DASHBOARD_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'nav.overview',
    href: '/dashboard/overview',
    icon: LayoutDashboard
  },
  {
    title: 'nav.myMaps',
    href: '/dashboard/maps/new',
    icon: Network
  },
  {
    title: 'nav.aiLab',
    href: '/dashboard/ai-lab',
    icon: Beaker
  },
  {
    title: 'nav.knowledgeBase',
    href: '/dashboard/knowledge-base/concepts',
    icon: BookOpen
  }
]
