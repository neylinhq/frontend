import { Beaker01Icon, BookOpen01Icon, LayoutGrid01Icon, Dataflow03Icon } from '@untitledui/icons-react/outline'
import type { ComponentType, SVGProps } from 'react'
import { DASHBOARD_ROUTES, KNOWLEDGE_BASE_ROUTES, MAPS_ROUTES } from '@/shared/config'

export interface SidebarItem {
  title: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const DASHBOARD_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'nav.overview',
    href: DASHBOARD_ROUTES.overview,
    icon: LayoutGrid01Icon
  },
  {
    title: 'nav.myMaps',
    href: MAPS_ROUTES.new,
    icon: Dataflow03Icon
  },
  {
    title: 'nav.aiLab',
    href: DASHBOARD_ROUTES.aiLab,
    icon: Beaker01Icon
  },
  {
    title: 'nav.knowledgeBase',
    href: KNOWLEDGE_BASE_ROUTES.concepts,
    icon: BookOpen01Icon
  }
]
