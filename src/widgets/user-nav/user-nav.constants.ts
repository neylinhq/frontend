import type { ComponentType, SVGProps } from 'react'

export interface UserNavItem {
  title: string
  href?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  shortcut?: {
    mac: string
    win: string
  }
  action?: string // идентификатор действия если это не ссылка
}

export interface UserNavSection {
  title?: string // Для лейблов или группировки
  items: UserNavItem[]
}

export const USER_NAV_ITEMS: UserNavItem[] = [
  // Эта часть для основных пунктов меню
]

// Для примера разделим как в макете
import {
  LayoutGrid01Icon,
  LogOut01Icon,
  Settings01Icon,
  Wallet01Icon
} from '@untitledui/icons-react/outline'

import { DASHBOARD_ROUTES, ROUTES, SETTINGS_ROUTES } from '@/shared/config'

export const getUserNavMainSection = (isDashboard: boolean): UserNavItem[] => {
  const items: UserNavItem[] = []

  // Conditional Dashboard link - only show when NOT in dashboard
  if (!isDashboard) {
    items.push({
      title: 'userNav.dashboard',
      href: DASHBOARD_ROUTES.overview,
      icon: LayoutGrid01Icon
    })
  }

  // Pricing (replaces Billing + Subscription)
  items.push({
    title: 'userNav.pricing',
    href: ROUTES.pricing,
    icon: Wallet01Icon,
    shortcut: {
      mac: '⌘P',
      win: 'Ctrl+P'
    }
  })

  // Settings
  items.push({
    title: 'nav.settings',
    href: SETTINGS_ROUTES.profile,
    icon: Settings01Icon,
    shortcut: {
      mac: '⌘S',
      win: 'Ctrl+S'
    }
  })

  return items
}

export const USER_NAV_LOGOUT_ITEM: UserNavItem = {
  title: 'nav.logout',
  icon: LogOut01Icon,
  action: 'logout',
  shortcut: {
    mac: '⇧⌘Q',
    win: 'Shift+Ctrl+Q'
  }
}
