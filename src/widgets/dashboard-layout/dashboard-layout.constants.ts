import { Beaker, BookOpen, LayoutDashboard, type LucideIcon, Network } from 'lucide-react'
import { DASHBOARD_ROUTES, KNOWLEDGE_BASE_ROUTES, MAPS_ROUTES } from '@/shared/config'

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon
}

export const DASHBOARD_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'nav.overview',
    href: DASHBOARD_ROUTES.overview,
    icon: LayoutDashboard
  },
  {
    title: 'nav.myMaps',
    href: MAPS_ROUTES.new,
    icon: Network
  },
  {
    title: 'nav.aiLab',
    href: DASHBOARD_ROUTES.aiLab,
    icon: Beaker
  },
  {
    title: 'nav.knowledgeBase',
    href: KNOWLEDGE_BASE_ROUTES.concepts,
    icon: BookOpen
  }
]
