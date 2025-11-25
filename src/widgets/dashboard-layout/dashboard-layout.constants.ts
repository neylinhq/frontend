import { Beaker, BookOpen, LayoutDashboard, type LucideIcon, Network } from 'lucide-react'

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon
}

export const DASHBOARD_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'Обзор',
    href: '/dashboard/overview',
    icon: LayoutDashboard
  },
  {
    title: 'Мои карты',
    href: '/dashboard/maps/new',
    icon: Network
  },
  {
    title: 'AI Лаборатория',
    href: '/dashboard/ai-lab',
    icon: Beaker
  },
  {
    title: 'База знаний',
    href: '/dashboard/knowledge-base/concepts',
    icon: BookOpen
  }
]
