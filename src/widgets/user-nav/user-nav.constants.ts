import type { LucideIcon } from 'lucide-react'

export interface UserNavItem {
  title: string
  href?: string
  icon: LucideIcon
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
import { CreditCard, LogOut, Settings, Sparkles } from 'lucide-react'
import { SETTINGS_ROUTES } from '@/shared/config'

export const USER_NAV_MAIN_SECTION: UserNavItem[] = [
  {
    title: 'nav.subscription',
    href: SETTINGS_ROUTES.billing,
    icon: Sparkles,
    shortcut: {
      mac: '⌘P',
      win: 'Ctrl+P'
    }
  },
  {
    title: 'nav.settings',
    href: SETTINGS_ROUTES.profile,
    icon: Settings,
    shortcut: {
      mac: '⌘S',
      win: 'Ctrl+S'
    }
  },
  {
    title: 'nav.billing',
    href: SETTINGS_ROUTES.billing,
    icon: CreditCard,
  }
]

export const USER_NAV_LOGOUT_ITEM: UserNavItem = {
  title: 'nav.logout',
  icon: LogOut,
  action: 'logout',
  shortcut: {
    mac: '⇧⌘Q',
    win: 'Shift+Ctrl+Q'
  }
}
